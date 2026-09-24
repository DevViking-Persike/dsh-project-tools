/** EditorController: operator actions exposed through generated Remote calls. */
import { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { EditorLanguageServersRequest, EditorLanguageServersValue, EditorListDirRequest, EditorListDirValue, EditorReadFileRequest, EditorReadFileValue } from './types.ts';
/** Deployment limits for editor operations. */
export interface Config {
    readonly editorMaxFileBytes: number;
}
/** editor Remote owner. */
export declare class EditorController extends TypertRemoteService {
    readonly config: Config;
    static inject: string[];
    static Config: z<Partial<Config>, Config>;
    /** @param ctx - Host services. @param config - validated deployment limits. */
    constructor(ctx: Context, config: Config);
    /** Execute editor.languageServers.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled editor result.
   */
    languageServers(request: EditorLanguageServersRequest, signal: AbortSignal): Promise<EditorLanguageServersValue>;
    /** Execute editor.listDir.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled editor result.
   */
    listDir(request: EditorListDirRequest, signal: AbortSignal): Promise<EditorListDirValue>;
    /** Execute editor.readFile.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled editor result.
   */
    readFile(request: EditorReadFileRequest, signal: AbortSignal): Promise<EditorReadFileValue>;
}
export default EditorController;
