import { DATABASE_URL } from '@app/classes/constants';
import { BEGINNER_NAME_MODEL } from '@app/classes/database.schema';
import * as mongoose from 'mongoose';
import { Service } from 'typedi';

@Service()
export class DatabaseService {
    database: mongoose.Mongoose = mongoose;
    private options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as mongoose.ConnectOptions;

    async start(url: string = DATABASE_URL): Promise<void> {
        await this.database
            .connect(url, this.options)
            .then(() => {
                // JUSTIFICATION : required in order to display the DB connection status
                // eslint-disable-next-line no-console
                console.log('Connected successfully to Mongodb Atlas');
            })
            .catch(() => {
                throw new Error('Distant database connection error');
            });

        const beginnerName = new BEGINNER_NAME_MODEL({
            aiName: 'Mikeaha',
        });
        beginnerName.remove();
        beginnerName.save();
    }

    async closeConnection(): Promise<void> {
        await mongoose.connection.close();
    }
}
