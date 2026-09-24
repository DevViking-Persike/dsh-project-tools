/** TreadmillController: operator actions exposed through generated Remote calls. */
import { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { TreadmillDescribeRequest, TreadmillDescribeValue, TreadmillReadFileRequest, TreadmillReadFileValue, TreadmillWriteFileRequest, TreadmillWriteFileValue, TreadmillUpdateStageRequest, TreadmillUpdateStageValue, TreadmillSaveToProjectRequest, TreadmillSaveToProjectValue } from './types.ts';
/** Deployment limits for treadmill operations. */
export interface Config {
}
/** treadmill Remote owner. */
export declare class TreadmillController extends TypertRemoteService {
    readonly config: Config;
    static inject: string[];
    static Config: z<Config>;
    /** @param ctx - Host services. @param config - validated deployment limits. */
    constructor(ctx: Context, config: Config);
    /** Execute treadmill.describe.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled treadmill result.
   */
    describe(request: TreadmillDescribeRequest, signal: AbortSignal): Promise<TreadmillDescribeValue>;
    /** Execute treadmill.readFile.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled treadmill result.
   */
    readFile(request: TreadmillReadFileRequest, signal: AbortSignal): Promise<TreadmillReadFileValue>;
    /** Execute treadmill.writeFile.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled treadmill result.
   */
    writeFile(request: TreadmillWriteFileRequest, signal: AbortSignal): Promise<TreadmillWriteFileValue>;
    /** Execute treadmill.updateStage.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled treadmill result.
   */
    updateStage(request: TreadmillUpdateStageRequest, signal: AbortSignal): Promise<TreadmillUpdateStageValue>;
    /** Execute treadmill.saveToProject.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled treadmill result.
   */
    saveToProject(request: TreadmillSaveToProjectRequest, signal: AbortSignal): Promise<TreadmillSaveToProjectValue>;
}
export default TreadmillController;
