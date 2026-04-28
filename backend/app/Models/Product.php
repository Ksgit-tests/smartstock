<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // Colonnes que l'on peut remplir via le code (protection masse assignment)
    protected $fillable = [
        'user_id',// id de l'utilisateur qui possède ce produit
        'name',// nom du produit
        'purchase_price',// prix d'achat
        'selling_price', // prix de vente
        'quantity',// quantité en stock
        'threshold',// seuil d'alerte pour le stock
        'category',// catégorie du produit
    ];

    // Un produit appartient à un seul utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);//
    }

    // Un produit a plusieurs ventes
    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    // Un produit a plusieurs achats
    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    // Est-ce que le stock est en alerte ?
    public function isLowStock(): bool
    {
        return $this->quantity <= $this->threshold;
    }
}