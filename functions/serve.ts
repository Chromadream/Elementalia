import handler from "serve-handler";
import { createServer } from "http";
import filewatcher from "filewatcher";
import { build } from "./build";

export async function serve(port: number) {
    const server = createServer((req, res) => handler(req, res, {public: `${process.cwd()}/finale/`}));
    server.listen(port, () => console.log(`Elementalia Development Server is running at port ${port}`));
    server.on('error', (e) => {
        server.close();
        if (e.name === 'EADDRINUSE'){
            console.log(`Port ${port} is in use.`);
            process.exit(1);
        }
        console.log('Something strange happened.')
        console.log(e);
        process.exit(255);
    });
    process.on('SIGINT', () => {
        console.log('Gracefully shutting down...')
        server.close()
    })
    return server;
}

export async function watchServe(port: number) {
    const watcher = filewatcher();
    watcher.add(`${process.cwd()}/apis/`);
    let server = await serve(port);
    watcher.on('change', async (_file: any, _stat: any) => {
        console.log("Changes detected. Rebuilding site.");
        server.close();
        await build();
        server = await serve(port);
    })
    process.on('SIGINT', () => {
        console.log("Removing file watcher...");
        watcher.removeAll();
    })
}