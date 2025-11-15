package com.example.argosapp.ui.history;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.example.argosapp.MainViewModel;
import com.example.argosapp.R;
import com.example.argosapp.databinding.FragmentHistoryBinding;
import com.example.argosapp.model.ScanHistoryItem;

import java.util.List;

public class HistoryFragment extends Fragment {

    private FragmentHistoryBinding binding;
    private MainViewModel viewModel;
    private HistoryAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentHistoryBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);
        adapter = new HistoryAdapter();

        binding.recyclerHistory.setLayoutManager(new LinearLayoutManager(requireContext()));
        binding.recyclerHistory.setAdapter(adapter);

        binding.historyToolbar.setNavigationOnClickListener(v -> navigateTo(R.id.action_historyFragment_to_scanFragment));
        binding.navScanFromHistory.setOnClickListener(v -> navigateTo(R.id.action_historyFragment_to_scanFragment));
        binding.navSettingsFromHistory.setOnClickListener(v -> navigateTo(R.id.action_historyFragment_to_settingsFragment));

        viewModel.history.observe(getViewLifecycleOwner(), this::renderHistory);
    }

    private void renderHistory(@NonNull List<ScanHistoryItem> items) {
        adapter.submitList(items);
        boolean empty = items.isEmpty();
        binding.emptyStateContainer.setVisibility(empty ? View.VISIBLE : View.GONE);
        binding.recyclerHistory.setVisibility(empty ? View.GONE : View.VISIBLE);
    }

    private void navigateTo(int actionId) {
        NavController navController = NavHostFragment.findNavController(this);
        navController.navigate(actionId);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}

