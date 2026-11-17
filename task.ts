import type { Static, TSchema } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import type { Event } from '@tak-ps/etl';
import { Feature } from '@tak-ps/node-cot'
import ETL, { SchemaType, handler as internal, local, DataFlowType, InvocationType } from '@tak-ps/etl';

const InputSchema = Type.Object({
    AccessToken: Type.String({
        default: '',
        description: 'Access Token for API calls'
    }),
    'DEBUG': Type.Boolean({
        default: false,
        description: 'Print results in logs'
    })
});

/**
 * The Output Schema contains the known properties that will be returned on the
 * GeoJSON Feature in the .properties.metdata object
 */
const OutputSchema = Type.Object({})

export default class Task extends ETL {
    static name = 'etl-drone-tag'
    static flow = [ DataFlowType.Incoming ];
    static invocation = [ InvocationType.Schedule ];

    async schema(
        type: SchemaType = SchemaType.Input,
        flow: DataFlowType = DataFlowType.Incoming
    ): Promise<TSchema> {
        if (flow !== DataFlowType.Incoming) return Type.Object({});
        if (type === SchemaType.Input) return InputSchema;

        return OutputSchema;
    }

    async control(): Promise<void> {
        // Get the Environment from the Server and ensure it conforms to the schema
        await this.env(InputSchema);

        const features: Static<typeof Feature.InputFeature>[] = [];

        // Get things here and convert them to GeoJSON Feature Collections
        // That conform to the node-cot Feature properties spec
        // https://github.com/dfpc-coe/node-CoT/

        const fc: Static<typeof Feature.InputFeatureCollection> = {
            type: 'FeatureCollection',
            features: features
        }

        await this.submit(fc);
    }
}

await local(await Task.init(import.meta.url), import.meta.url);
export async function handler(event: Event = {}): ReturnType<typeof internal> {
    return internal(new Task(import.meta.url), event);
}

