package com.example.argosapp.ui.history;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.argosapp.databinding.ItemHistoryCardBinding;

class HistoryViewHolder extends RecyclerView.ViewHolder {

    final ItemHistoryCardBinding binding;

    HistoryViewHolder(@NonNull ItemHistoryCardBinding binding) {
        super(binding.getRoot());
        this.binding = binding;
    }
}

