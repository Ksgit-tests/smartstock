<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            
            // Clé étrangère vers products
            // constrained('products') = "cette colonne référence products.id"
            // onDelete('cascade') = "si le produit est supprimé, supprime aussi ses ventes"
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->onDelete('cascade');
            
            $table->integer('quantity');              // Combien d'unités vendues
            $table->decimal('unit_price', 10, 2);     // Prix à l'unité AU MOMENT DE LA VENTE
            $table->decimal('total_price', 10, 2);    // quantité × unit_price (stocké pour fiabilité)
            
            $table->timestamps();                     // created_at = date/heure de la vente
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};