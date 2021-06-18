const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        manufacturer: { type: Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0 },
        features: { type: [String] },
        image: {
            data: Buffer,
            contentType: String
        },

        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
    }
);

ProductSchema
    .virtual('url')
    .get(function() {
        return `/product/${this._id}`;
    });

module.exports = mongoose.model('Product', ProductSchema);