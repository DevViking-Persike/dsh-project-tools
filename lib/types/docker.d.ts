/** DockerController: operator actions exposed through generated Remote calls. */
import { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { DockerEngineStatusRequest, DockerEngineStatusValue, DockerStartEngineRequest, DockerStartEngineValue, DockerInstallEngineRequest, DockerInstallEngineValue, DockerListContainersRequest, DockerListContainersValue, DockerControlRequest, DockerControlValue, DockerRemoveContainerRequest, DockerRemoveContainerValue, DockerRemoveImageRequest, DockerRemoveImageValue, DockerListImagesRequest, DockerListImagesValue, DockerLogsRequest, DockerLogsValue, DockerBrowseComposeRequest, DockerBrowseComposeValue, DockerComposeUpRequest, DockerComposeUpValue, DockerComposeDownRequest, DockerComposeDownValue } from './types.ts';
/** Deployment limits for docker operations. */
export interface Config {
    readonly dockerLogMaxChars: number;
    readonly dockerComposeBrowseMaxEntries: number;
    readonly dockerComposeOutputMaxChars: number;
}
/** docker Remote owner. */
export declare class DockerController extends TypertRemoteService {
    readonly config: Config;
    static inject: string[];
    static Config: z<Partial<Config>, Config>;
    /** @param ctx - Host services. @param config - validated deployment limits. */
    constructor(ctx: Context, config: Config);
    /** Execute docker.engineStatus.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    engineStatus(request: DockerEngineStatusRequest, signal: AbortSignal): Promise<DockerEngineStatusValue>;
    /** Execute docker.startEngine.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    startEngine(request: DockerStartEngineRequest, signal: AbortSignal): Promise<DockerStartEngineValue>;
    /** Execute docker.installEngine.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    installEngine(request: DockerInstallEngineRequest, signal: AbortSignal): Promise<DockerInstallEngineValue>;
    /** Execute docker.listContainers.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    listContainers(request: DockerListContainersRequest, signal: AbortSignal): Promise<DockerListContainersValue>;
    /** Execute docker.control.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    control(request: DockerControlRequest, signal: AbortSignal): Promise<DockerControlValue>;
    /** Execute docker.removeContainer.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    removeContainer(request: DockerRemoveContainerRequest, signal: AbortSignal): Promise<DockerRemoveContainerValue>;
    /** Execute docker.removeImage.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    removeImage(request: DockerRemoveImageRequest, signal: AbortSignal): Promise<DockerRemoveImageValue>;
    /** Execute docker.listImages.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    listImages(request: DockerListImagesRequest, signal: AbortSignal): Promise<DockerListImagesValue>;
    /** Execute docker.logs.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    logs(request: DockerLogsRequest, signal: AbortSignal): Promise<DockerLogsValue>;
    /** Execute docker.browseCompose.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    browseCompose(request: DockerBrowseComposeRequest, signal: AbortSignal): Promise<DockerBrowseComposeValue>;
    /** Execute docker.composeUp.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    composeUp(request: DockerComposeUpRequest, signal: AbortSignal): Promise<DockerComposeUpValue>;
    /** Execute docker.composeDown.
   * @param request - operator parameters.
   * @param signal - caller cancellation.
   * @returns the settled docker result.
   */
    composeDown(request: DockerComposeDownRequest, signal: AbortSignal): Promise<DockerComposeDownValue>;
}
export default DockerController;
