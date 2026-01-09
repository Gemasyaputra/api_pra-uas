<?php
/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

// ====================================================================
// DUMMY CART DATA
// Data keranjang akan disimpan sementara di memori.
// ====================================================================
$carts = [
    'items' => [
        [
            'id' => 1,
            'name' => 'Produk A',
            'quantity' => 2,
            'price' => 50.00
        ],
        [
            'id' => 2,
            'name' => 'Produk B',
            'quantity' => 1,
            'price' => 30.00
        ],
        [
            'id' => 3,
            'name' => 'Produk C',
            'quantity' => 1,
            'price' => 50.00
        ]
    ],
    'total' => 130.00
];

// ====================================================================
// CART SERVICE API ENDPOINTS
// ====================================================================

// Base Route
$router->get('/', function () use ($router) {
    return response()->json(['service' => 'Cart Service is running', 'framework' => 'Lumen']);
});

// GET all carts
$router->get('/carts', function () use ($carts) {
    return response()->json($carts);
});

// GET cart by id (Detail Cart) - Dibuat lebih aman
$router->get('/carts/{id}', function ($id) use ($carts) {
    $itemId = (int) $id;

    foreach ($carts['items'] as $item) {
        // PERBAIKAN: Tambahkan pengaman isset() untuk mencegah "Undefined array key"
        if (isset($item['id']) && $item['id'] === $itemId) { 
            return response()->json($item);
        }
    }
    // Menggunakan response helper Lumen/Laravel
    return response()->json(['message' => 'Item not found'], 404);
});
$router->delete('/carts/{id}', function ($id) {
    global $carts; // pastikan pakai global
    $cartId = (int) $id;
    $itemFound = false;

    if (!isset($carts['items']) || !is_array($carts['items'])) {
        return response()->json(['message' => 'Cart kosong'], 400);
    }

    foreach ($carts['items'] as $key => $item) {
        if (is_array($item) && isset($item['id']) && $item['id'] === $cartId) {
            unset($carts['items'][$key]);
            $itemFound = true;
            break;
        }
    }

    if (!$itemFound) return response()->json(['message' => 'Item not found'], 404);

    $carts['items'] = array_values($carts['items']);
    $carts['total'] = array_reduce($carts['items'], function($sum, $item){
        return $sum + ($item['quantity'] ?? 0) * ($item['price'] ?? 0);
    }, 0);

    return response()->json([
        'message' => 'Item deleted successfully',
        'new_cart_data' => $carts
    ]);
});
