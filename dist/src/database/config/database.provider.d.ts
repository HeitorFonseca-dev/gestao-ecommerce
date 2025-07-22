import { DataSource } from 'typeorm';
export declare const AppDataSource: DataSource;
export declare const dataBaseProviders: {
    provide: string;
    useFactory: () => Promise<DataSource>;
}[];
