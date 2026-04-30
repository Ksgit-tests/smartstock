<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AIController;


// Routes publiques (pas besoin de token)
Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route pour l'assistant IA
Route::post('ai/chat', [AIController::class, 'chat']);

// Routes protégées (token obligatoire)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout',      [AuthController::class, 'logout']);
    Route::get('me',           [AuthController::class, 'me']);
    Route::get('dashboard',    [DashboardController::class, 'index']);
    Route::apiResource('products',  ProductController::class);
    Route::apiResource('sales',     SaleController::class);
    Route::apiResource('purchases', PurchaseController::class);
    
});


//Route::apiResource('products', ProductController::class);
// Route pour les opérations CRUD sur les produits

//Route::apiResource('sales', SaleController::class);
// Route pour les opérations CRUD sur les ventes

//Route::apiResource('purchases', PurchaseController::class);
// Route pour les opérations CRUD sur les achats

//Route::get('dashboard', [DashboardController::class, 'index']);
// Route pour récupérer les données du dashboard
