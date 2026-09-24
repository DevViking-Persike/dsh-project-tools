/** DockerController: operator actions exposed through generated Remote calls. */
import { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { fail, dockerAbsent, dockerError, dockerComposeError, dockerContainerEntry, dockerImageEntry, composeCrumbs, composeLevel } from './helpers.ts'
import type { DockerEngineStatusRequest, DockerEngineStatusValue, DockerStartEngineRequest, DockerStartEngineValue, DockerInstallEngineRequest, DockerInstallEngineValue, DockerListContainersRequest, DockerListContainersValue, DockerControlRequest, DockerControlValue, DockerRemoveContainerRequest, DockerRemoveContainerValue, DockerRemoveImageRequest, DockerRemoveImageValue, DockerListImagesRequest, DockerListImagesValue, DockerLogsRequest, DockerLogsValue, DockerBrowseComposeRequest, DockerBrowseComposeValue, DockerComposeUpRequest, DockerComposeUpValue, DockerComposeDownRequest, DockerComposeDownValue } from './types.ts'

import { stat } from 'node:fs/promises'
import { homedir } from 'node:os'

/** Deployment limits for docker operations. */
export interface Config { readonly dockerLogMaxChars: number
  readonly dockerComposeBrowseMaxEntries: number
  readonly dockerComposeOutputMaxChars: number }
/** docker Remote owner. */
export class DockerController extends TypertRemoteService {
  static inject = ['typert', 'sessionController', 'workspaceRegistry']
  static Config: z<Partial<Config>, Config> = z.object({ dockerLogMaxChars: z.number().step(1).min(1).default(40000),
    dockerComposeBrowseMaxEntries: z.number().step(1).min(1).default(500),
    dockerComposeOutputMaxChars: z.number().step(1).min(1).default(40000) })
  /** @param ctx - Host services. @param config - validated deployment limits. */
  constructor(ctx: Context, readonly config: Config) { super(ctx, 'dockerController', { namespace: 'docker' }) }
  /** Execute docker.engineStatus.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async engineStatus(request: DockerEngineStatusRequest, signal: AbortSignal): Promise<DockerEngineStatusValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const docker = ctx.get('docker')
    if (docker === undefined) {
      return {
        status: {
          running: false,
          startable: false,
          installable: false,
          detail: dockerAbsent().message,
        },
      }
    }
    try {
      return { status: { ...await docker.engineStatus(signal) } }
    }
    catch (error: unknown) {
      return fail(dockerError(error))
    }
  }
  /** Execute docker.startEngine.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async startEngine(request: DockerStartEngineRequest, signal: AbortSignal): Promise<DockerStartEngineValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const docker = ctx.get('docker')
    if (docker === undefined)
      return fail(dockerAbsent())
    try {
      const result = await docker.startEngine(signal)
      return { status: { ...result.status }, output: result.output }
    }
    catch (error: unknown) {
      return fail(dockerError(error))
    }
  }
  /** Execute docker.installEngine.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async installEngine(request: DockerInstallEngineRequest, signal: AbortSignal): Promise<DockerInstallEngineValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const docker = ctx.get('docker')
    if (docker === undefined)
      return fail(dockerAbsent())
    try {
      const result = await docker.installEngine(signal)
      return { status: { ...result.status }, output: result.output }
    }
    catch (error: unknown) {
      return fail(dockerError(error))
    }
  }
  /** Execute docker.listContainers.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async listContainers(request: DockerListContainersRequest, signal: AbortSignal): Promise<DockerListContainersValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const docker = ctx.get('docker')
    if (docker === undefined)
      return fail(dockerAbsent())
    const { all, project } = request
    try {
      const containers = await docker.list({
        ...all === undefined ? {} : { all },
        ...project === undefined ? {} : { project },
      }, signal)
      return { containers: containers.map(dockerContainerEntry) }
    }
    catch (error: unknown) {
      return fail(dockerError(error))
    }
  }
  /** Execute docker.control.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async control(request: DockerControlRequest, signal: AbortSignal): Promise<DockerControlValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const docker = ctx.get('docker')
    if (docker === undefined)
      return fail(dockerAbsent())
    const { container, action } = request
    try {
      const settled = await docker.control({ container, action }, signal)
      return { container: dockerContainerEntry(settled) }
    }
    catch (error: unknown) {
      return fail(dockerComposeError(error))
    }
  }
  /** Execute docker.removeContainer.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async removeContainer(request: DockerRemoveContainerRequest, signal: AbortSignal): Promise<DockerRemoveContainerValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const docker = ctx.get('docker')
    if (docker === undefined)
      return fail(dockerAbsent())
    const { container, force } = request
    try {
      await docker.removeContainer({ container, ...force === undefined ? {} : { force } }, signal)
      return { container }
    }
    catch (error: unknown) {
      return fail(dockerComposeError(error))
    }
  }
  /** Execute docker.removeImage.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async removeImage(request: DockerRemoveImageRequest, signal: AbortSignal): Promise<DockerRemoveImageValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const docker = ctx.get('docker')
    if (docker === undefined)
      return fail(dockerAbsent())
    const { image, force } = request
    try {
      await docker.removeImage({ image, ...force === undefined ? {} : { force } }, signal)
      return { image }
    }
    catch (error: unknown) {
      return fail(dockerComposeError(error))
    }
  }
  /** Execute docker.listImages.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async listImages(request: DockerListImagesRequest, signal: AbortSignal): Promise<DockerListImagesValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const docker = ctx.get('docker')
    if (docker === undefined)
      return fail(dockerAbsent())
    try {
      const images = await docker.images(signal)
      return { images: images.map(dockerImageEntry) }
    }
    catch (error: unknown) {
      return fail(dockerError(error))
    }
  }
  /** Execute docker.logs.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async logs(request: DockerLogsRequest, signal: AbortSignal): Promise<DockerLogsValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const docker = ctx.get('docker')
    if (docker === undefined)
      return fail(dockerAbsent())
    const { container, tail } = request
    try {
      const result = await docker.logs({
        container,
        ...tail === undefined ? {} : { tail },
      }, signal)
      // Keep the newest characters: the tail of a log explains a failure
      // that just happened. `truncated` stays true when the provider
      // already dropped entries under its own cap.
      const over = result.content.length > this.config.dockerLogMaxChars
      return {
        container: result.container,
        content: over ? result.content.slice(result.content.length - this.config.dockerLogMaxChars) : result.content,
        truncated: over || result.truncated,
      }
    }
    catch (error: unknown) {
      return fail(dockerError(error))
    }
  }
  /** Execute docker.browseCompose.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async browseCompose(request: DockerBrowseComposeRequest, signal: AbortSignal): Promise<DockerBrowseComposeValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const { path } = request
    const target = path ?? homedir()
    try {
      const stats = await stat(target)
      if (!stats.isDirectory()) {
        return fail({
          code: 'directory-unreadable',
          message: `"${target}" is not a directory`,
          details: { path: target },
        })
      }
      const { entries, truncated } = await composeLevel(target, this.config.dockerComposeBrowseMaxEntries)
      if (signal.aborted)
        return fail({ code: 'gateway/cancelled', message: 'browse cancelled', details: {} })
      return {
        path: target,
        home: homedir(),
        crumbs: composeCrumbs(target),
        entries,
        truncated,
      }
    }
    catch (error: unknown) {
      return fail({
        code: 'directory-unreadable',
        message: `cannot read "${target}": ${error instanceof Error ? error.message : String(error)}`,
        details: { path: target },
      })
    }
  }
  /** Execute docker.composeUp.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async composeUp(request: DockerComposeUpRequest, signal: AbortSignal): Promise<DockerComposeUpValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const docker = ctx.get('docker')
    if (docker === undefined)
      return fail(dockerAbsent())
    const { file, project } = request
    try {
      const result = await docker.composeUp({
        file,
        ...project === undefined ? {} : { project },
      }, signal)
      return {
        project: result.project,
        // Keep the newest characters: Compose reports progress
        // chronologically, so the tail carries the outcome.
        output: result.output.length > this.config.dockerComposeOutputMaxChars
          ? result.output.slice(result.output.length - this.config.dockerComposeOutputMaxChars)
          : result.output,
        containers: result.containers.map(dockerContainerEntry),
      }
    }
    catch (error: unknown) {
      return fail(dockerComposeError(error))
    }
  }
  /** Execute docker.composeDown.
 * @param request - operator parameters.
 * @param signal - caller cancellation.
 * @returns the settled docker result.
 */
  @Remote
  async composeDown(request: DockerComposeDownRequest, signal: AbortSignal): Promise<DockerComposeDownValue> {
    const ctx = this.ctx; void ctx; void request; void signal
    const docker = ctx.get('docker')
    if (docker === undefined)
      return fail(dockerAbsent())
    const { file, project } = request
    try {
      const result = await docker.composeDown({
        file,
        ...project === undefined ? {} : { project },
      }, signal)
      return {
        project: result.project,
        // Keep the newest characters: Compose reports progress
        // chronologically, so the tail carries the outcome.
        output: result.output.length > this.config.dockerComposeOutputMaxChars
          ? result.output.slice(result.output.length - this.config.dockerComposeOutputMaxChars)
          : result.output,
        containers: result.containers.map(dockerContainerEntry),
      }
    }
    catch (error: unknown) {
      return fail(dockerComposeError(error))
    }
  }
}
export default DockerController
