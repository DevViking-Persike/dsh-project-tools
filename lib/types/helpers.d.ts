import type { Context } from '@deepseek-ai/cordis';
import { type RemoteErrorCode } from '@deepseek-ai/dsh-typert-protocol';
import { type FileSystem, type FsTarget } from '@deepseek-ai/dsh-fs';
import { type DockerContainer, type DockerImage } from '@persike/dsh-project-tools/docker';
import type { SandboxExecutionPolicy } from '@deepseek-ai/dsh-sandbox';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { DockerComposeBrowseEntry, DockerContainerEntry, DockerImageEntry } from './types.ts';
/** Failure raised by a project operation. */
export interface ProjectFailure {
    code: RemoteErrorCode;
    message: string;
    details: {};
}
/**
 * Raise a typed project refusal for the Remote gateway.
 * @param failure - project refusal.
 * @returns never; always throws the typed failure.
 */
export declare function fail(failure: ProjectFailure): never;
/** Provider-selection failures rendered as Docker unavailable. */
export declare const DOCKER_SELECTION_CODES: ReadonlySet<string>;
/**
 * The wire refusal when no composition mounts the Docker service.
 * @returns the Docker-unavailable failure.
 */
export declare function dockerAbsent(): ProjectFailure;
/**
 * Map Docker provider failures to the wire vocabulary.
 * @param error - caught provider failure.
 * @returns unavailable for selection failures, otherwise internal failure.
 */
export declare function dockerError(error: unknown): ProjectFailure;
/**
 * Map one Compose failure onto the wire vocabulary. A selection failure stays
 * the empty state, but an engine that rejected the project is a distinct
 * answer: the operator's file was reached and refused, so the client shows the
 * engine's own text instead of an internal fault.
 * @param error - caught Compose failure.
 * @returns the Compose or provider-selection failure.
 */
export declare function dockerComposeError(error: unknown): ProjectFailure;
/**
 * Project a container into its wire representation.
 * @param container - provider-owned container.
 * @returns detached container metadata.
 */
export declare function dockerContainerEntry(container: DockerContainer): DockerContainerEntry;
/**
 * Project an image into its wire representation.
 * @param image - provider-owned image.
 * @returns detached image metadata.
 */
export declare function dockerImageEntry(image: DockerImage): DockerImageEntry;
/**
 * Whether a file name is one this browser offers as a compose candidate.
 * @param name - the directory entry's base name.
 * @returns true when the name is a recognized compose file.
 */
export declare function isComposeFileName(name: string): boolean;
/**
 * The wire refusal when no composition mounts a filesystem service.
 * @returns the editor-unavailable failure.
 */
export declare function editorAbsent(): ProjectFailure;
/** The project's own stage table, relative to its root; absent means the harness default table applies. */
export declare const PROJECT_TABLE = ".spec/treadmill.yaml";
/**
 * Where an installation skill or command lives when saved into a project:
 * the project `.dsh/skills` root, which outranks the harness copy there. A
 * command becomes a flat skill file; every other installation path is refused.
 * @param path - installation-relative path.
 * @returns the project-relative path, or `undefined` when not a skill or command.
 */
export declare function projectSkillPath(path: string): string | undefined;
/**
 * The wire refusal when no composition mounts the Treadmill service.
 * @returns the Treadmill-unavailable failure.
 */
export declare function treadmillAbsent(): ProjectFailure;
/**
 * Map an installation-file failure onto the Treadmill wire vocabulary.
 * @param error - caught installation-file failure.
 * @returns the access or internal failure.
 */
export declare function treadmillError(error: unknown): ProjectFailure;
/**
 * Map one filesystem failure onto the editor's wire vocabulary. Each code is a
 * state the editor renders differently, so they stay distinct rather than
 * collapsing into one internal error.
 * @param error - caught filesystem operation failure.
 * @returns the editor-specific or internal failure.
 */
export declare function editorError(error: unknown): ProjectFailure;
/**
 * A path that resolved outside the session's workspace root. Separate from the
 * sandbox's own refusal because this fence runs first, on every operation
 * including reads, so a wire value can never address the wider filesystem.
 */
export declare class EditorOutsideWorkspace extends Error {
    constructor(path: string);
}
/**
 * The sandbox policy one editor write runs under. Resolved from the addressed
 * session so the write honors that session's mode and workspace root; without
 * a session the deployment default applies, which is the stricter answer.
 *
 * @param ctx - host context carrying the sandbox-policy and session services.
 * @param sessionId - the addressed session, when the client named one.
 * @returns the resolved policy, or undefined when no policy service is mounted.
 */
export declare function editorPolicy(ctx: Context, sessionId: SessionId | undefined): SandboxExecutionPolicy | undefined;
/**
 * The workspace root the editor is fenced by: the addressed session's project
 * directory, else the deployment's own root.
 *
 * @param ctx - host context carrying the session and sandbox-policy services.
 * @param fs - the filesystem seam.
 * @param cwd - the addressed session's project directory, when the client named a session that records one.
 * @param signal - cancellation for the resolution.
 * @returns the resolved root target.
 */
export declare function editorRoot(ctx: Context, fs: FileSystem, cwd: string | undefined, signal: AbortSignal): Promise<FsTarget>;
/**
 * Resolve a client-supplied path and prove it lives inside `root`.
 *
 * @param fs - the filesystem seam.
 * @param root - the workspace root the path must be contained by.
 * @param path - the client-supplied path.
 * @param signal - cancellation for the resolution.
 * @returns the resolved target.
 * @throws {EditorOutsideWorkspace} when the path escapes the root.
 */
export declare function editorTarget(fs: FileSystem, root: FsTarget, path: string, signal: AbortSignal): Promise<FsTarget>;
/**
 * Ancestor chain from the filesystem root to `target` inclusive — the
 * breadcrumb rows of a compose browse, every one a jump target.
 * @param target - absolute directory the browse listed.
 * @returns the crumbs, root first.
 */
export declare function composeCrumbs(target: string): DockerComposeBrowseEntry[];
/**
 * List one directory level, keeping child directories and compose YAML files.
 * Directories come first, each group name-sorted, so the rows read as
 * "descend here" before "pick this".
 * @param target - absolute directory to list.
 * @param maxEntries - cap on returned rows.
 * @returns the rows and whether the cap dropped any.
 */
export declare function composeLevel(target: string, maxEntries: number): Promise<{
    entries: DockerComposeBrowseEntry[];
    truncated: boolean;
}>;
/**
 * Read the recorded project directory without activating the Agent.
 * @param ctx - Session controller owner.
 * @param sessionId - optional Session address.
 * @returns recorded project directory, or undefined without a Session address.
 */
export declare function sessionCwd(ctx: Context, sessionId: SessionId | undefined): Promise<string | undefined>;
/**
 * Read a Session's optional workspace-local Treadmill stage table.
 * @param ctx - host filesystem and Session services.
 * @param sessionId - optional Session address.
 * @param signal - caller cancellation.
 * @returns the resolved file and text, or undefined when unavailable or absent.
 */
export declare function projectTable(ctx: Context, sessionId: SessionId | undefined, signal: AbortSignal): Promise<{
    target: FsTarget;
    text: string;
} | undefined>;
