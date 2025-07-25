import fs from "fs/promises";

export class FileAccesser {

    public constructor(
        private readonly filePath: string,
        private readonly createIfNotExists: boolean = true
    ) {
    }

    //Escrever dados no arquivo, criando o diretório se necessário
    public async write(data: string): Promise<void> {
        try {

            const fileExists: boolean = await fs.access(this.filePath).then(() => true).catch(() => false);

            if (fileExists) {
                await fs.writeFile(this.filePath, data, { encoding: "utf-8" });
                return;
            } else if (this.createIfNotExists) {
                await fs.mkdir(this.filePath.substring(0, this.filePath.lastIndexOf('/')), { recursive: true });
                await fs.writeFile(this.filePath, data, { encoding: "utf-8" });
                return;
            }

            throw new Error(`File ${this.filePath} does not exist and createIfNotExists is set to false.`);

        } catch (error) {
            console.error(`Error ao escrever no arquivo ${this.filePath}:`, error);
            throw error;
        }

    }

    //Retornar todas as linhas do arquivo como uma lista de strings
    public async toList(): Promise<string[]> {
        try {

            const data: string = await fs.readFile(this.filePath, { encoding: "utf-8" });
            return data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        } catch(error) {
            console.error(`Error ao ler o arquivo ${this.filePath}:`, error);
            throw error;
        }
    }

    public async insertJSON(data: string[]): Promise<void> {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            await this.write(jsonData);
        } catch (error) {
            console.error(`Error ao inserir JSON no arquivo ${this.filePath}:`, error);
            throw error;
        }
    }

    public async readJSON(): Promise<string[]> {
        try {
            const data: string = await fs.readFile(this.filePath, { encoding: "utf-8" });
            return JSON.parse(data);
        } catch (ignored) {
            throw ignored;
        }
    }
}