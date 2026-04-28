<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    //
    protected $fillable = [
        'product_id', // id du produit acheté
        'quantity', // quantité achetée
        'unit_cost', // prix d'achat unitaire
        'total_cost', // prix total de l'achat
    ];
    public function product()
    {
        return $this->belongsTo(Product::class);// Un achat appartient à un seul produit
    }
}
