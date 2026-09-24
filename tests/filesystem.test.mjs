import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import { SessionStore, SessionId } from '@deepseek-ai/dsh-session'
import { FsError } from '@deepseek-ai/dsh-fs'
import { LocalFileSystem } from '@deepseek-ai/dsh-fs-local'
import Treadmill from '@persike/dsh-treadmill'
import { TreadmillController, EditorController } from '../lib/types/index.js'
import { editorError } from '../lib/types/helpers.js'

// Source-launched Hosts and installed plugins can evaluate the SDK separately.
const { FsError: HostFsError } = await import(`${import.meta.resolve('@deepseek-ai/dsh-fs')}?host-generation`)
assert.notEqual(HostFsError, FsError)
class HostFileSystem extends LocalFileSystem {
  failure
  async readText(...args) {
    if (this.failure) throw this.failure
    try { return await super.readText(...args) }
    catch (error) { throw new HostFsError(error.message, error.code, { cause: error }) }
  }
}
const signal = () => new AbortController().signal

for (const Provider of [LocalFileSystem, HostFileSystem]) {
  test(`${Provider.name}: missing project table uses global stages and first toggle creates project table`, async t => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-table-fallback-'))
    const project = join(root, 'project')
    await mkdir(project)
    const ctx = new Context()
    const fibers = []
    t.after(async () => {
      for (const fiber of fibers.reverse()) await fiber.dispose()
      await rm(root, { recursive: true, force: true })
    })
    for (const plugin of [AgentRegistry, SkillRegistry, SessionStore]) fibers.push(await ctx.plugin(plugin))
    fibers.push(await ctx.plugin(Treadmill, { root: join(root, 'global') }))
    fibers.push(await ctx.plugin(Provider, { cwd: project }))
    const sessionId = SessionId('project-table')
    ctx.sessions.create(sessionId, { meta: { cwd: project } })
    const controller = new TreadmillController(ctx, {})
    const initial = await controller.describe({ sessionId }, signal())
    assert.equal(initial.tableSource, 'global')
    assert.ok(initial.stages.length > 0)
    assert.equal((await controller.updateStage({ sessionId, id: '40-redteam', enabled: false }, signal())).tableSource, 'project')
    const updated = await controller.describe({ sessionId }, signal())
    assert.equal(updated.tableSource, 'project')
    assert.equal(updated.stages.find(stage => stage.id === '40-redteam').enabled, false)
    assert.equal(updated.stages.find(stage => stage.id === '40-seguranca').enabled, false)
    assert.equal((await controller.describe({}, signal())).stages.find(stage => stage.id === '40-redteam').enabled, true)
    await writeFile(join(project, 'binary'), Buffer.from([0, 255, 0]))
    const editor = new EditorController(ctx, EditorController.Config({}))
    await assert.rejects(editor.readFile({ sessionId, path: 'binary' }, signal()), { code: 'editor-not-text' })
    await assert.rejects(editor.readFile({ sessionId, path: '../outside' }, signal()), { code: 'editor-denied' })
    if (Provider === HostFileSystem) {
      for (const code of ['FS_PERMISSION_DENIED', 'FS_IO_ERROR', 'FS_ABORTED']) {
        ctx.fs.failure = new HostFsError('project table is inaccessible', code)
        await assert.rejects(controller.describe({ sessionId }, signal()), { code })
      }
      ctx.fs.failure = undefined
    }
    const stopped = AbortSignal.abort()
    await assert.rejects(controller.describe({ sessionId }, stopped), { code: 'FS_ABORTED' })
  })
}

test('filesystem error codes keep their public meaning across SDK module generations', () => {
  for (const [code, expected] of [
    ['FS_STALE_VERSION', 'editor-stale'],
    ['FS_SANDBOX_DENIED', 'editor-denied'],
    ['FS_PERMISSION_DENIED', 'editor-denied'],
    ['FS_NOT_TEXT', 'editor-not-text'],
    ['FS_TOO_LARGE', 'editor-too-large'],
    ['FS_IO_ERROR', 'gateway/internal'],
  ]) {
    const error = new HostFsError('filesystem failure', code)
    assert.equal(error instanceof FsError, false)
    assert.deepEqual(editorError(error), { code: expected, message: error.message, details: {} })
  }
})
