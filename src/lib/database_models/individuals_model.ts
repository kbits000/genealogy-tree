import mongoose, {Schema} from "mongoose";
import {v4 as uuidv4} from 'uuid';

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
        spouses_ids: [{
            spouse_id: {type: Schema.Types.ObjectId, ref: "individuals"},
            spouse_first_name: {type: String},
            sex: {type: String, enum: ["male", "female", "unknown"]},
            is_dead: {type: String, enum: ["alive", "dead", "unknown"]},
            is_divorced: {type: String, enum: ["yes", "no", "unknown"], default: 'unknown'},
            spouse_public_id: {type: String},
        }],
        siblings_ids: [
            {
                sibling_id: {type: Schema.Types.ObjectId, ref: "individuals"},
                sibling_first_name: {type: String},
                sex: {type: String, enum: ["male", "female", "unknown"]},
                is_dead: {type: String, enum: ["alive", "dead", "unknown"]},
                relationshipSide: {type: String, enum: ["mother", "father", "unknown"], default: 'unknown'},
                sibling_public_id: {type: String},
            }
        ],
        grandmothers_ids: [{
            grandmother_id: {type: Schema.Types.ObjectId, ref: "individuals"},
            grandmother_first_name: {type: String},
            is_dead: {type: String, enum: ["alive", "dead", "unknown"]},
            relationshipSide: {type: String, enum: ["mother", "father", "unknown"], default: 'unknown'},
            grandmother_public_id: {type: String},
        }],
        grandfathers_ids: [{
            grandfather_id: {type: Schema.Types.ObjectId, ref: "individuals"},
            grandfather_first_name: {type: String},
            is_dead: {type: String, enum: ["alive", "dead", "unknown"]},
            relationshipSide: {type: String, enum: ["mother", "father", "unknown"], default: 'unknown'},
            grandfather_public_id: {type: String},
        }],
        children_ids: [{
            child_id: {type: Schema.Types.ObjectId, ref: "individuals"},
            child_first_name: {type: String},
            sex: {type: String, enum: ["male", "female", "unknown"]},
            is_dead: {type: String, enum: ["alive", "dead", "unknown"]},
            child_public_id: {type: String},
        }],
        individuals_ids: [{
            individual_id: {type: Schema.Types.ObjectId, ref: "individuals"},
            relationship: {type: String},
            is_dead: {type: String, enum: ["alive", "dead", "unknown"]},
            sex: {type: String, enum: ["male", "female", "unknown"]},
            additional_information: {type: String},
            individual_public_id: {type: String},
        }],
    },
    {timestamps: true}
);

const IndividualModel = mongoose.models.individuals || mongoose.model('individuals', IndividualSchema);

export default IndividualModel;