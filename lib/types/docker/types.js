/**
 * Vocabulary for the Docker capability seam (`ctx.docker`). Containers,
 * images, and Compose projects share one seam because they share one engine
 * connection, one selection decision, and one error taxonomy; their request
 * and result types stay separate.
 * @module @persike/dsh-project-tools/docker/types
 */
import { HarnessError } from '@deepseek-ai/dsh-llm';
/**
 * Typed Docker error with a machine-routable, open-string `code` and chained
 * `cause`. Consumers must tolerate provider-specific codes. The seam itself
 * raises `DOCKER_PROVIDER_UNAVAILABLE`, `DOCKER_PROVIDER_AMBIGUOUS`,
 * `DOCKER_PROVIDER_CONFIGURED_MISSING`,
 * `DOCKER_PROVIDER_CONFIGURED_UNAVAILABLE`, and `DOCKER_PROVIDER_DUPLICATE`;
 * providers add engine-level codes such as `DOCKER_ENGINE_FAILED`,
 * `DOCKER_NOT_FOUND`, and `DOCKER_INVALID_REQUEST`. Tool execution exposes the
 * code in structured error metadata.
 */
export class DockerError extends HarnessError {
}
//# sourceMappingURL=types.js.map