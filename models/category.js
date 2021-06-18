const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },

        products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
    }
);

ProductSchema
    .virtual('url')
    .get(function() {
        return `/category/${this._id}`;
    });

module.exports = mongoose.model('Product', ProductSchema);