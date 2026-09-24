/** EditorController: operator actions exposed through generated Remote calls. */
import { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { fail, editorAbsent, editorError, editorRoot, editorTarget, sessionCwd } from './helpers.ts'
import type { EditorLanguageServersRequest, EditorLanguageServersValue, EditorListDirRequest, EditorListDirValue, EditorReadFileRequest, EditorReadFileValue } from './types.ts'
import type {} from '@deepseek-ai/dsh-lsp'


/** Deployment limits for editor operations. */
export interface Config { readonly editorMaxFileBytes: number }
/** editor Remote owner. */
export class EditorController extends TypertRemoteService {
  static inject = ['typert', 'sessionController', 'workspaceRegistry', 'sessions']
  static Config: z<Partial<Config>, Config> = z.object({ editorMaxFileBytes: z.number().step(1).min(1).default(5242880) })
  /** @param ctx - Host services. @param config - validated deployment limits. */
  constructor(ctx: Context, readonly config: Config) { super(ctx, 'editorController', { namespace: 'editor' }) }
  /** Execute editor.languageServers.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled editor result.
 */
  @Remote
  async languageServers(request: EditorLanguageServersRequest, signal: AbortSignal): Promise<EditorLanguageServersValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const lsp = ctx.get('lsp')
    if (lsp === undefined)
      return Promise.resolve({ servers: [] })
    return Promise.resolve({
      servers: lsp.describeProviders().map(provider => ({
        id: String(provider.id),
        extensions: [...provider.extensions],
      })),
    })
  }
  /** Execute editor.listDir.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled editor result.
 */
  @Remote
  async listDir(request: EditorListDirRequest, signal: AbortSignal): Promise<EditorListDirValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const fs = ctx.get('fs')
    if (fs === undefined)
      return fail(editorAbsent())
    const { sessionId, path } = request
    try {
      const root = await editorRoot(ctx, fs, await sessionCwd(ctx, sessionId), signal)
      const target = path === undefined || path === ''
        ? root
        : await editorTarget(fs, root, path, signal)
      const children = await fs.listDir(target, signal)
      // Directories first, then files: a tree reads top-down, and mixing
      // the two by name alone buries folders among their siblings.
      const entries = children
        .filter(child => child.type === 'file' || child.type === 'directory')
        .map(child => ({
          name: child.name,
          path: child.target.displayPath,
          directory: child.type === 'directory',
        }))
        .sort((a, b) => a.directory === b.directory
          ? a.name.localeCompare(b.name)
          : (a.directory ? -1 : 1))
      return { path: target.displayPath, root: root.displayPath, entries }
    }
    catch (error: unknown) {
      return fail(editorError(error))
    }
  }
  /** Execute editor.readFile.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled editor result.
 */
  @Remote
  async readFile(request: EditorReadFileRequest, signal: AbortSignal): Promise<EditorReadFileValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const fs = ctx.get('fs')
    if (fs === undefined)
      return fail(editorAbsent())
    const { sessionId, path } = request
    try {
      const root = await editorRoot(ctx, fs, await sessionCwd(ctx, sessionId), signal)
      const target = await editorTarget(fs, root, path, signal)
      const info = await fs.stat(target, signal)
      if (info === undefined) {
        return fail({ code: 'editor-not-found', message: `"${path}" does not exist`, details: {} })
      }
      if (info.type !== 'file') {
        return fail({ code: 'editor-not-found', message: `"${path}" is not a file`, details: {} })
      }
      if (info.size !== undefined && info.size > this.config.editorMaxFileBytes) {
        return fail({
          code: 'editor-too-large',
          message: `"${path}" is larger than this editor opens (${String(this.config.editorMaxFileBytes)} bytes)`,
          details: {},
        })
      }
      const content = await fs.readText(target, signal)
      return { path: target.displayPath, content, version: String(info.version) }
    }
    catch (error: unknown) {
      return fail(editorError(error))
    }
  }
}
export default EditorController
