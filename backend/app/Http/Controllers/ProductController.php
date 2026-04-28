<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/products
    // Retourne tous les produits de l'utilisateur connecté
    public function index()
{
    $products = Product::where('user_id', auth()->id())->get();

    return response()->json([
        'success' => true,
        'data'    => $products,
    ]);
}

    /**
     * Store a newly created resource in storage.
     * // POST /api/products
     * // Crée un nouveau produit avec les données fournies dans la requête
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'name'           => 'required|string|max:255',
        'purchase_price' => 'required|numeric|min:0',
        'selling_price'  => 'required|numeric|min:0',
        'quantity'       => 'required|integer|min:0',
        'threshold'      => 'required|integer|min:0',
        'category'       => 'nullable|string|max:255',
    ]);

    $validated['user_id'] = auth()->id(); // ← Plus jamais user_id = 1

    $product = Product::create($validated);

    return response()->json([
        'success' => true,
        'data'    => $product,
    ], 201);
}

    
     //Display the specified resource.
     // GET /api/products/{product}
    // Route Model Binding : Laravel injecte automatiquement le Product
    // Si l'ID n'existe pas → 404 automatique, pas besoin de le gérer
     
    public function show(Product $product)
    {
        
        return response()->json([
            'success' => true,
            'data'    => $product,
        ]);
    }

    /**
     * Update the specified resource in storage.
     *  PUT /api/products/{product}
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'           => 'sometimes|required|string|max:255',// Le champ 'name' est requis seulement s'il est présent dans la requête
            'purchase_price' => 'sometimes|required|numeric|min:0',// Le champ 'purchase_price' est requis seulement s'il est présent dans la requête
            'selling_price'  => 'sometimes|required|numeric|min:0',// Le champ 'selling_price' est requis seulement s'il est présent dans la requête
            'quantity'       => 'sometimes|required|integer|min:0',
            'threshold'      => 'sometimes|required|integer|min:0',
            'category'       => 'nullable|string|max:255',
        ]);
    
        $product->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $product,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    // DELETE /api/products/{product}
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produit supprimé avec succès',
        ]);
    }
}

