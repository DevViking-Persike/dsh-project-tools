var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import z from '@deepseek-ai/schemastery';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { fail, dockerAbsent, dockerError, dockerComposeError, dockerContainerEntry, dockerImageEntry, composeCrumbs, composeLevel } from "./helpers.js";
import { stat } from 'node:fs/promises';
import { homedir } from 'node:os';
/** docker Remote owner. */
let DockerController = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _engineStatus_decorators;
    let _startEngine_decorators;
    let _installEngine_decorators;
    let _listContainers_decorators;
    let _control_decorators;
    let _removeContainer_decorators;
    let _removeImage_decorators;
    let _listImages_decorators;
    let _logs_decorators;
    let _browseCompose_decorators;
    let _composeUp_decorators;
    let _composeDown_decorators;
    return class DockerController extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _engineStatus_decorators = [Remote];
            _startEngine_decorators = [Remote];
            _installEngine_decorators = [Remote];
            _listContainers_decorators = [Remote];
            _control_decorators = [Remote];
            _removeContainer_decorators = [Remote];
            _removeImage_decorators = [Remote];
            _listImages_decorators = [Remote];
            _logs_decorators = [Remote];
            _browseCompose_decorators = [Remote];
            _composeUp_decorators = [Remote];
            _composeDown_decorators = [Remote];
            __esDecorate(this, null, _engineStatus_decorators, { kind: "method", name: "engineStatus", static: false, private: false, access: { has: obj => "engineStatus" in obj, get: obj => obj.engineStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _startEngine_decorators, { kind: "method", name: "startEngine", static: false, private: false, access: { has: obj => "startEngine" in obj, get: obj => obj.startEngine }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _installEngine_decorators, { kind: "method", name: "installEngine", static: false, private: false, access: { has: obj => "installEngine" in obj, get: obj => obj.installEngine }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listContainers_decorators, { kind: "method", name: "listContainers", static: false, private: false, access: { has: obj => "listContainers" in obj, get: obj => obj.listContainers }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _control_decorators, { kind: "method", name: "control", static: false, private: false, access: { has: obj => "control" in obj, get: obj => obj.control }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _removeContainer_decorators, { kind: "method", name: "removeContainer", static: false, private: false, access: { has: obj => "removeContainer" in obj, get: obj => obj.removeContainer }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _removeImage_decorators, { kind: "method", name: "removeImage", static: false, private: false, access: { has: obj => "removeImage" in obj, get: obj => obj.removeImage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listImages_decorators, { kind: "method", name: "listImages", static: false, private: false, access: { has: obj => "listImages" in obj, get: obj => obj.listImages }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _logs_decorators, { kind: "method", name: "logs", static: false, private: false, access: { has: obj => "logs" in obj, get: obj => obj.logs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _browseCompose_decorators, { kind: "method", name: "browseCompose", static: false, private: false, access: { has: obj => "browseCompose" in obj, get: obj => obj.browseCompose }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _composeUp_decorators, { kind: "method", name: "composeUp", static: false, private: false, access: { has: obj => "composeUp" in obj, get: obj => obj.composeUp }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _composeDown_decorators, { kind: "method", name: "composeDown", static: false, private: false, access: { has: obj => "composeDown" in obj, get: obj => obj.composeDown }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        config = __runInitializers(this, _instanceExtraInitializers);
        static inject = ['typert', 'sessionController', 'workspaceRegistry'];
        static Config = z.object({ dockerLogMaxChars: z.number().step(1).min(1).default(40000),
            dockerComposeBrowseMaxEntries: z.number().step(1).min(1).default(500),
            dockerComposeOutputMaxChars: z.number().step(1).min(1).default(40000) });
        /** @param ctx - Host services. @param config - validated deployment limits. */
        constructor(ctx, config) {
            super(ctx, 'dockerController', { namespace: 'docker' });
            this.config = config;
        }
        /** Execute docker.engineStatus.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async engineStatus(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const docker = ctx.get('docker');
            if (docker === undefined) {
                return {
                    status: {
                        running: false,
                        startable: false,
                        installable: false,
                        detail: dockerAbsent().message,
                    },
                };
            }
            try {
                return { status: { ...await docker.engineStatus(signal) } };
            }
            catch (error) {
                return fail(dockerError(error));
            }
        }
        /** Execute docker.startEngine.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async startEngine(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const docker = ctx.get('docker');
            if (docker === undefined)
                return fail(dockerAbsent());
            try {
                const result = await docker.startEngine(signal);
                return { status: { ...result.status }, output: result.output };
            }
            catch (error) {
                return fail(dockerError(error));
            }
        }
        /** Execute docker.installEngine.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async installEngine(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const docker = ctx.get('docker');
            if (docker === undefined)
                return fail(dockerAbsent());
            try {
                const result = await docker.installEngine(signal);
                return { status: { ...result.status }, output: result.output };
            }
            catch (error) {
                return fail(dockerError(error));
            }
        }
        /** Execute docker.listContainers.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async listContainers(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const docker = ctx.get('docker');
            if (docker === undefined)
                return fail(dockerAbsent());
            const { all, project } = request;
            try {
                const containers = await docker.list({
                    ...all === undefined ? {} : { all },
                    ...project === undefined ? {} : { project },
                }, signal);
                return { containers: containers.map(dockerContainerEntry) };
            }
            catch (error) {
                return fail(dockerError(error));
            }
        }
        /** Execute docker.control.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async control(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const docker = ctx.get('docker');
            if (docker === undefined)
                return fail(dockerAbsent());
            const { container, action } = request;
            try {
                const settled = await docker.control({ container, action }, signal);
                return { container: dockerContainerEntry(settled) };
            }
            catch (error) {
                return fail(dockerComposeError(error));
            }
        }
        /** Execute docker.removeContainer.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async removeContainer(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const docker = ctx.get('docker');
            if (docker === undefined)
                return fail(dockerAbsent());
            const { container, force } = request;
            try {
                await docker.removeContainer({ container, ...force === undefined ? {} : { force } }, signal);
                return { container };
            }
            catch (error) {
                return fail(dockerComposeError(error));
            }
        }
        /** Execute docker.removeImage.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async removeImage(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const docker = ctx.get('docker');
            if (docker === undefined)
                return fail(dockerAbsent());
            const { image, force } = request;
            try {
                await docker.removeImage({ image, ...force === undefined ? {} : { force } }, signal);
                return { image };
            }
            catch (error) {
                return fail(dockerComposeError(error));
            }
        }
        /** Execute docker.listImages.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async listImages(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const docker = ctx.get('docker');
            if (docker === undefined)
                return fail(dockerAbsent());
            try {
                const images = await docker.images(signal);
                return { images: images.map(dockerImageEntry) };
            }
            catch (error) {
                return fail(dockerError(error));
            }
        }
        /** Execute docker.logs.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async logs(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const docker = ctx.get('docker');
            if (docker === undefined)
                return fail(dockerAbsent());
            const { container, tail } = request;
            try {
                const result = await docker.logs({
                    container,
                    ...tail === undefined ? {} : { tail },
                }, signal);
                // Keep the newest characters: the tail of a log explains a failure
                // that just happened. `truncated` stays true when the provider
                // already dropped entries under its own cap.
                const over = result.content.length > this.config.dockerLogMaxChars;
                return {
                    container: result.container,
                    content: over ? result.content.slice(result.content.length - this.config.dockerLogMaxChars) : result.content,
                    truncated: over || result.truncated,
                };
            }
            catch (error) {
                return fail(dockerError(error));
            }
        }
        /** Execute docker.browseCompose.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async browseCompose(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const { path } = request;
            const target = path ?? homedir();
            try {
                const stats = await stat(target);
                if (!stats.isDirectory()) {
                    return fail({
                        code: 'directory-unreadable',
                        message: `"${target}" is not a directory`,
                        details: { path: target },
                    });
                }
                const { entries, truncated } = await composeLevel(target, this.config.dockerComposeBrowseMaxEntries);
                if (signal.aborted)
                    return fail({ code: 'gateway/cancelled', message: 'browse cancelled', details: {} });
                return {
                    path: target,
                    home: homedir(),
                    crumbs: composeCrumbs(target),
                    entries,
                    truncated,
                };
            }
            catch (error) {
                return fail({
                    code: 'directory-unreadable',
                    message: `cannot read "${target}": ${error instanceof Error ? error.message : String(error)}`,
                    details: { path: target },
                });
            }
        }
        /** Execute docker.composeUp.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async composeUp(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const docker = ctx.get('docker');
            if (docker === undefined)
                return fail(dockerAbsent());
            const { file, project } = request;
            try {
                const result = await docker.composeUp({
                    file,
                    ...project === undefined ? {} : { project },
                }, signal);
                return {
                    project: result.project,
                    // Keep the newest characters: Compose reports progress
                    // chronologically, so the tail carries the outcome.
                    output: result.output.length > this.config.dockerComposeOutputMaxChars
                        ? result.output.slice(result.output.length - this.config.dockerComposeOutputMaxChars)
                        : result.output,
                    containers: result.containers.map(dockerContainerEntry),
                };
            }
            catch (error) {
                return fail(dockerComposeError(error));
            }
        }
        /** Execute docker.composeDown.
       * @param request - operator parameters.
       * @param signal - caller cancellation.
       * @returns the settled docker result.
       */
        async composeDown(request, signal) {
            const ctx = this.ctx;
            void ctx;
            void request;
            void signal;
            const docker = ctx.get('docker');
            if (docker === undefined)
                return fail(dockerAbsent());
            const { file, project } = request;
            try {
                const result = await docker.composeDown({
                    file,
                    ...project === undefined ? {} : { project },
                }, signal);
                return {
                    project: result.project,
                    // Keep the newest characters: Compose reports progress
                    // chronologically, so the tail carries the outcome.
                    output: result.output.length > this.config.dockerComposeOutputMaxChars
                        ? result.output.slice(result.output.length - this.config.dockerComposeOutputMaxChars)
                        : result.output,
                    containers: result.containers.map(dockerContainerEntry),
                };
            }
            catch (error) {
                return fail(dockerComposeError(error));
            }
        }
    };
})();
export { DockerController };
export default DockerController;
//# sourceMappingURL=docker.js.map