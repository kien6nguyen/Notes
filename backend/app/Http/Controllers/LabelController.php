<?php

namespace App\Http\Controllers;

use App\Models\Label;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->labels);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'color' => 'nullable|string|max:7',
        ]);

        $label = $request->user()->labels()->create($validated);

        return response()->json($label, 201);
    }

    public function update(Request $request, Label $label)
    {
        if ($label->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'color' => 'nullable|string|max:7',
        ]);

        $label->update($validated);

        return response()->json($label);
    }

    public function destroy(Request $request, Label $label)
    {
        if ($label->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $label->delete();

        return response()->json(['message' => 'Label deleted successfully']);
    }
}
