import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import Treadmill from '@persike/dsh-treadmill'
import Docker from '../lib/types/docker/index.js'
import { LocalDockerProvider } from '../lib/types/docker-local/index.js'
import { DockerController, EditorController, TreadmillController } from '../lib/types/index.js'
import remote from '../lib/typert.remote-client.js'
import { TYPERT } from '../lib/typert.host.js'

const signal = () => new AbortController().signal

test('generated Remote methods contain Docker, read-only editor and Treadmill only', () => {
  const methods = remote.descriptors.map(item => `${item.namespace}/${item.method}`)
  assert.ok(methods.includes('docker/removeContainer'))
  assert.ok(methods.includes('docker/removeImage'))
  assert.ok(methods.includes('editor/readFile'))
  assert.ok(methods.includes('treadmill/updateStage'))
  assert.ok(methods.every(method => !method.startsWith('git/')))
  assert.ok(!methods.includes('editor/writeFile'))
  assert.ok(TYPERT)
  const update = remote.descriptors.find(item => item.namespace === 'treadmill' && item.method === 'updateStage')
  const schema = update.parameters[0].codec.create()
  assert.equal(schema.safeParse({ id: 'deploy', enabled: false }).success, true)
  assert.equal(schema.safeParse({ enabled: false }).success, false)
})

test('Docker runtime selects providers and removes scoped registration on disposal', async t => {
  const ctx = new Context()
  const runtime = ctx.plugin(Docker)
  t.after(() => runtime.dispose())
  await runtime
  const provider = ctx.plugin({ inject: ['docker'], apply(child) {
    child.docker.registerProvider({ id: 'test', available: async () => true, list: async () => [], images: async () => [] })
  } })
  t.after(() => provider.dispose())
  await provider
  assert.deepEqual(await ctx.docker.list(), [])
  assert.deepEqual(ctx.docker.providerIds(), ['test'])
  await provider.dispose()
  assert.deepEqual(ctx.docker.providerIds(), [])
  await assert.rejects(ctx.docker.list(), { code: 'DOCKER_PROVIDER_UNAVAILABLE' })
  assert.equal(typeof LocalDockerProvider, 'function')
})

test('extracted Treadmill controller updates actual seeded stages', async t => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-project-tools-'))
  const ctx = new Context()
  const fibers = [await ctx.plugin(AgentRegistry), await ctx.plugin(SkillRegistry)]
  t.after(async () => {
    for (const fiber of fibers.reverse()) await fiber.dispose()
    await rm(root, { recursive: true, force: true })
  })
  const mounted = ctx.plugin(Treadmill, { root })
  fibers.push(mounted)
  await mounted
  const controller = new TreadmillController(ctx, {})
  assert.equal((await controller.describe({}, signal())).tableSource, 'global')
  await controller.updateStage({ id: '40-redteam', enabled: false }, signal())
  const description = await controller.describe({}, signal())
  assert.equal(description.stages.find(stage => stage.id === '40-seguranca').enabled, false)
  assert.equal(description.stages.find(stage => stage.id === '25').enabled, true)
  await assert.rejects(controller.readFile({ path: '../outside' }, signal()), { code: 'treadmill-denied' })
})

test('read-only editor reports absent filesystem and exposes no write method', async () => {
  const ctx = new Context()
  const editor = new EditorController(ctx, EditorController.Config({}))
  assert.deepEqual(await editor.languageServers({}, signal()), { servers: [] })
  await assert.rejects(editor.readFile({ path: 'x' }, signal()), { code: 'editor-unavailable' })
  assert.equal(editor.writeFile, undefined)
  assert.equal(typeof DockerController, 'function')
})
