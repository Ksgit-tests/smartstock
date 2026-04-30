<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class AIController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'messages' => 'required|array',
            'system'   => 'nullable|string',
        ]);

        try {
            $client = new Client();

            //  injecte le system prompt au début de la conversation si fourni
            $messages = $request->messages;

            if ($request->system) {
                array_unshift($messages, [
                    "role" => "system",
                    "content" => $request->system
                ]);
            }

            $response = $client->post('https://openrouter.ai/api/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . env('OPENROUTER_API_KEY'),
                    'Content-Type'  => 'application/json',
                    'HTTP-Referer'  => config('app.url'), // optionnel, mais peut aider à l'identification de l'application
                    'X-Title'       => 'SmartStock Insight'
                ],
                'json' => [
                    "model" => "nvidia/nemotron-3-super-120b-a12b:free", // modèle OK
                    "messages" => $messages,
                ],
            ]);

            $data = json_decode($response->getBody(), true);

            return response()->json($data);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur API',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}