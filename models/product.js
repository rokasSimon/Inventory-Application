const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0 },
        features: { type: [String] },

        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
    }
);

ProductSchema
    .virtual('url')
    .get(function() {
        return `/manga/${this._id}`;
    });

module.exports = mongoose.model('Product', ProductSchema);