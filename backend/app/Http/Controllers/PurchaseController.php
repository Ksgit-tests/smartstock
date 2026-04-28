<?php

namespace App\Http\Controllers; // ← Namespace corrigé

use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    // GET /api/purchases
    public function index(): JsonResponse
    {
        $purchases = Purchase::with('product')
                     ->whereHas('product', function ($query) {
                         $query->where('user_id', auth()->id());
                     })
                     ->latest()
                     ->get();
                     
        return response()->json([
            'success' => true,
            'data'    => $purchases,
        ]);
    }

    // POST /api/purchases
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            // Soit product_id (produit existant)
            'product_id'     => 'required_without:product_name|exists:products,id|nullable',

            // Soit les infos d'un nouveau produit
            'product_name'   => 'required_without:product_id|string|max:255|nullable',
            'selling_price'  => 'required_with:product_name|numeric|min:0|nullable',
            'threshold'      => 'nullable|integer|min:0',
            'category'       => 'nullable|string|max:255',

            // Commun aux deux cas
            'quantity'       => 'required|integer|min:1',
            'unit_cost'      => 'required|numeric|min:0',
        ]);

        $purchase = DB::transaction(function () use ($validated) {

            // Cas 1 : produit existant
            if (!empty($validated['product_id'])) {
                $product = Product::findOrFail($validated['product_id']);
            }
            // Cas 2 : nouveau produit → on le crée à la volée
            else {
                $product = Product::create([
                    'user_id'        => auth()->id(), // ← Plus jamais user_id = 1
                    'name'           => $validated['product_name'],
                    'purchase_price' => $validated['unit_cost'],
                    'selling_price'  => $validated['selling_price'],
                    'quantity'       => 0, // Commence à 0, sera incrémenté après
                    'threshold'      => $validated['threshold'] ?? 5,
                    'category'       => $validated['category'] ?? null,
                ]);
            }

            // Calcul automatique du total
            $totalCost = $validated['quantity'] * $validated['unit_cost'];

            // Créer l'achat
            $purchase = Purchase::create([
                'product_id' => $product->id,
                'quantity'   => $validated['quantity'],
                'unit_cost'  => $validated['unit_cost'],
                'total_cost' => $totalCost,
            ]);

            // Incrémenter le stock
            $product->increment('quantity', $validated['quantity']);

            return $purchase;
        });

        return response()->json([
            'success' => true,
            'data'    => $purchase->load('product'),
        ], 201);
    }

    // GET /api/purchases/{purchase}
    public function show(Purchase $purchase): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $purchase->load('product'),
        ]);
    }

    // DELETE /api/purchases/{purchase}
    public function destroy(Purchase $purchase): JsonResponse
    {
        DB::transaction(function () use ($purchase) {
            // Annuler l'effet sur le stock
            $purchase->product->decrement('quantity', $purchase->quantity);
            $purchase->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Achat supprimé avec succès.',
        ]);
    }
}