const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ManufacturerSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },

        products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
    }
);

ManufacturerSchema
    .virtual('url')
    .get(function() {
        return `/manufacturer/${this._id}`;
    });

module.exports = mongoose.model('Manufacturer', ManufacturerSchema);