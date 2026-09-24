/** TreadmillController: operator actions exposed through generated Remote calls. */
import { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { fail, editorAbsent, PROJECT_TABLE, projectSkillPath, treadmillAbsent, treadmillError, editorPolicy, editorRoot, editorTarget, sessionCwd, projectTable } from './helpers.ts'
import type { TreadmillDescribeRequest, TreadmillDescribeValue, TreadmillReadFileRequest, TreadmillReadFileValue, TreadmillWriteFileRequest, TreadmillWriteFileValue, TreadmillUpdateStageRequest, TreadmillUpdateStageValue, TreadmillSaveToProjectRequest, TreadmillSaveToProjectValue } from './types.ts'


import { parsePipeline, PIPELINE_FILE, updateStageInTable } from '@persike/dsh-treadmill'
/** Deployment limits for treadmill operations. */
export interface Config {  }
/** treadmill Remote owner. */
export class TreadmillController extends TypertRemoteService {
  static inject = ['typert', 'sessionController', 'workspaceRegistry', 'sessions']
  static Config: z<Config> = z.object({})
  /** @param ctx - Host services. @param config - validated deployment limits. */
  constructor(ctx: Context, readonly config: Config) { super(ctx, 'treadmillController', { namespace: 'treadmill' }) }
  /** Execute treadmill.describe.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled treadmill result.
 */
  @Remote
  async describe(request: TreadmillDescribeRequest, signal: AbortSignal): Promise<TreadmillDescribeValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const treadmill = ctx.get('treadmill')
    if (treadmill === undefined)
      return fail(treadmillAbsent())
    const description = await treadmill.describe()
    const project = await projectTable(ctx, request.sessionId, signal)
    if (project === undefined)
      return { ...description, tableSource: 'global' }
    try {
      const { pipelineError: _global, ...rest } = description
      return { ...rest, tableSource: 'project', stages: parsePipeline(project.text) }
    }
    catch (error: unknown) {
      return {
        ...description, tableSource: 'project', stages: [],
        pipelineError: `${PROJECT_TABLE}: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }
  /** Execute treadmill.readFile.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled treadmill result.
 */
  @Remote
  async readFile(request: TreadmillReadFileRequest, signal: AbortSignal): Promise<TreadmillReadFileValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const treadmill = ctx.get('treadmill')
    if (treadmill === undefined)
      return fail(treadmillAbsent())
    try {
      return { path: request.path, content: await treadmill.readFile(request.path) }
    }
    catch (error: unknown) {
      return fail(treadmillError(error))
    }
  }
  /** Execute treadmill.writeFile.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled treadmill result.
 */
  @Remote
  async writeFile(request: TreadmillWriteFileRequest, signal: AbortSignal): Promise<TreadmillWriteFileValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const treadmill = ctx.get('treadmill')
    if (treadmill === undefined)
      return fail(treadmillAbsent())
    try {
      await treadmill.writeFile(request.path, request.content)
      return { path: request.path }
    }
    catch (error: unknown) {
      return fail(treadmillError(error))
    }
  }
  /** Execute treadmill.updateStage.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled treadmill result.
 */
  @Remote
  async updateStage(request: TreadmillUpdateStageRequest, signal: AbortSignal): Promise<TreadmillUpdateStageValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const treadmill = ctx.get('treadmill')
    if (treadmill === undefined)
      return fail(treadmillAbsent())
    const { sessionId, id, enabled, gate } = request
    const patch = { ...enabled === undefined ? {} : { enabled }, ...gate === undefined ? {} : { gate } }
    try {
      if (sessionId === undefined) {
        await treadmill.updateStage(id, patch)
        return { id, tableSource: 'global' }
      }
      // The project's own table starts as a copy of the effective table,
      // so the first switch records every stage, not just the one flipped.
      const fs = ctx.get('fs')
      if (fs === undefined)
        return fail(editorAbsent())
      const project = await projectTable(ctx, sessionId, signal)
      const text = project?.text ?? await treadmill.readFile(PIPELINE_FILE)
      const target = project?.target
            ?? await editorTarget(fs, await editorRoot(ctx, fs, await sessionCwd(ctx, sessionId), signal), PROJECT_TABLE, signal)
      await fs.writeText(target, updateStageInTable(text, id, patch), undefined, signal, editorPolicy(ctx, sessionId))
      return { id, tableSource: 'project' }
    }
    catch (error: unknown) {
      return fail(treadmillError(error))
    }
  }
  /** Execute treadmill.saveToProject.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled treadmill result.
 */
  @Remote
  async saveToProject(request: TreadmillSaveToProjectRequest, signal: AbortSignal): Promise<TreadmillSaveToProjectValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const treadmill = ctx.get('treadmill')
    if (treadmill === undefined)
      return fail(treadmillAbsent())
    const fs = ctx.get('fs')
    if (fs === undefined)
      return fail(editorAbsent())
    const { sessionId, path, content } = request
    const projectPath = projectSkillPath(path)
    if (projectPath === undefined) {
      return fail({ code: 'treadmill-denied', message: `"${path}" is not a skill or command; only those can live in a project`, details: {} })
    }
    try {
      const target = await editorTarget(fs, await editorRoot(ctx, fs, await sessionCwd(ctx, sessionId), signal), projectPath, signal)
      await fs.writeText(target, content, undefined, signal, editorPolicy(ctx, sessionId))
      return { path: projectPath }
    }
    catch (error: unknown) {
      return fail(treadmillError(error))
    }
  }
}
export default TreadmillController
