<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();                           // BIGINT UNSIGNED, PK, auto-increment
            $table->foreignId('user_id')            // BIGINT UNSIGNED + FK
                  ->constrained('users')             // Lie à la table users.id
                  ->onDelete('cascade');             // Si user supprimé → ses produits aussi
            $table->string('name');                 // VARCHAR(255)
            $table->decimal('purchase_price', 10, 2); // DECIMAL(10,2)
            $table->decimal('selling_price', 10, 2);  // DECIMAL(10,2)
            $table->integer('quantity')->default(0);  // INTEGER, défaut 0
            $table->integer('threshold')->default(5); // INTEGER, défaut 5
            $table->string('category')->nullable();   // VARCHAR, peut être null
            $table->timestamps();                     // created_at + updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};