import handler from "serve-handler";
import { createServer } from "http";

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
}