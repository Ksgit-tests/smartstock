<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    //
    protected $fillable = [
        'product_id', // id du produit vendu
        'quantity', // quantité vendue
        'unit_price', // prix de vente unitaire
        'total_price', // prix total de la vente
    ];
    public function product()
    {
        return $this->belongsTo(Product::class);// Une vente appartient à un seul produit
    }
    
}
