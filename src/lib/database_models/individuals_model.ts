import mongoose, {Schema} from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const IndividualSchema: Schema = new mongoose.Schema(
    {
        public_id: {
                type: Schema.Types.UUID,
                default: uuidv4,
                unique: true,
                index: true
        },
        first_name: {type: String, required: true},
        parent_name: {type: String},
        grandparent_name: {type: String},
        last_name: {type: String},
        nickname: {type: String},
        profile_picture: {picture: Buffer, content_type: String},
        sex: {type: String, enum: ["male", "female", "unknown"], required: true},
        birth_date: {type: Date},
        birth_place: {type: String},
        is_dead: {type: String, enum: ["alive", "dead", "unknown"], required: true},
        death_place: {type: String},
        death_date: {type: Date},
        additional_information: {type: String},
        mother_id: {type: Schema.Types.ObjectId, ref: "individuals"},
        father_id: {type: Schema.Types.ObjectId, ref: "individuals"},
        wives_ids: [{type: Schema.Types.ObjectId, ref: "individuals"}],
        husbands_ids: [{type: Schema.Types.ObjectId, ref: "individuals"}],
        siblings_ids: [
            {type: Schema.Types.ObjectId, ref: "individuals"},
        ],
        grandmother_id: [{type: Schema.Types.ObjectId, ref: "individuals"}],
        grandfather_id: [{type: Schema.Types.ObjectId, ref: "individuals"}],
        individuals_ids: [
            {
                    individual_id: {type: Schema.Types.ObjectId, ref: "individuals"},
                    relationship: {type: String},
            }
        ],
    },
    {timestamps: true}
);

const IndividualModel = mongoose.models.individuals || mongoose.model('individuals', IndividualSchema);

export default IndividualModel;