<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    // GET /api/sales
    public function index()
    {
        // 'with' charge le produit associé en même temps
        // Sans ça : 10 ventes = 10 requêtes SQL supplémentaires
        // Avec ça : 1 seule requête SQL (c'est le "eager loading")
        $sales = Sale::with('product')
             ->whereHas('product', function ($query) {
                 $query->where('user_id', auth()->id());
             })
             ->latest()
             ->get();

        return response()->json([
            'success' => true,
            'data'    => $sales,
        ]);
    }

    // POST /api/sales
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        // Récupère le produit concerné
        $product = Product::find($validated['product_id']);

        // Vérification métier : stock suffisant ?
        if ($product->quantity < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => "Stock insuffisant. Disponible : {$product->quantity}",
            ], 422);
        }

        // DB::transaction garantit que les deux opérations
        // réussissent ensemble ou échouent ensemble
        // Si le decrement réussit mais que la création de Sale plante
        // → tout est annulé automatiquement. Pas de stock perdu sans vente.
        $sale = DB::transaction(function () use ($validated, $product) {

            // Calcul automatique du total
            $validated['total_price'] = $validated['quantity'] * $validated['unit_price'];

            // Crée la ligne dans sales
            $sale = Sale::create($validated);

            // Décrémente le stock du produit
            $product->decrement('quantity', $validated['quantity']);

            return $sale;
        });

        return response()->json([
            'success' => true,
            'data'    => $sale,
        ], 201);
    }

    // GET /api/sales/{sale}
    public function show(Sale $sale)
    {
        return response()->json([
            'success' => true,
            'data'    => $sale->load('product'),// Charge le produit associé avant de retourner la vente
        ]);
    }

    // DELETE /api/sales/{sale}
    public function destroy(Sale $sale)
    {
        // On ne supprime jamais une vente en production
        // mais on garde la méthode pour le développement
        $sale->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vente supprimée',
        ]);
    }
}