<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Purchase;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    // GET /api/dashboard
    public function index(): JsonResponse
    {
        $userId = auth()->id();

// Récupère uniquement les IDs des produits de CE commerçant
        $productIds = Product::where('user_id', $userId)->pluck('id');



    
        // Carbon est la librairie de dates de Laravel
        // now() = maintenant, startOfMonth() = 1er du mois à 00:00:00
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth   = Carbon::now()->endOfMonth();

        // 1. Chiffre d'affaires du mois
        // SUM(total_price) WHERE created_at BETWEEN début et fin du mois
        // Tous les calculs filtrés sur ces produits
        $revenue = Sale::whereIn('product_id', $productIds)
               ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
               ->sum('total_price');
        // 2. Dépenses du mois
        // SUM(total_cost) WHERE created_at BETWEEN début et fin du mois
        $expenses = Purchase::whereIn('product_id', $productIds)
                    ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                    ->sum('total_cost');

        // 3. Bénéfice net = CA - Dépenses
        $profit = $revenue - $expenses;

        // 4. Produits en alerte stock
        // COUNT(*) WHERE quantity <= threshold
        $lowStockCount = Product::where('user_id', $userId)
                        ->whereColumn('quantity', '<=', 'threshold')
                        ->count();

        // 5. Liste des produits en alerte (pour affichage détaillé)
        $lowStockProducts = Product::where('user_id', $userId)
                                   ->whereColumn('quantity', '<=', 'threshold')
                                   ->select('id', 'name', 'quantity', 'threshold')
                                   ->get();

        // 6. Dernières ventes (pour le tableau du dashboard)
        $recentSales = Sale::with('product')
                           ->latest()
                           ->take(5)
                           ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'revenue'           => round($revenue, 2),
                'expenses'          => round($expenses, 2),
                'profit'            => round($profit, 2),
                'low_stock_count'   => $lowStockCount,
                'low_stock_products'=> $lowStockProducts,
                'recent_sales'      => $recentSales,
                'period'            => Carbon::now()->format('F Y'), // ex: "April 2026"
            ],
        ]);
    }
}