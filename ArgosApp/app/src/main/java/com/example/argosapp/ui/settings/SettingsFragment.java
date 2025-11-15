package com.example.argosapp.ui.settings;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;

import com.example.argosapp.MainViewModel;
import com.example.argosapp.R;
import com.example.argosapp.databinding.FragmentSettingsBinding;

public class SettingsFragment extends Fragment {

    private FragmentSettingsBinding binding;
    private MainViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentSettingsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        setupRow(binding.rowProfile, SettingsDestination.PROFILE);
        setupRow(binding.rowNotifications, SettingsDestination.NOTIFICATIONS);
        setupRow(binding.rowAppSettings, SettingsDestination.APP_SETTINGS);
        setupRow(binding.rowAbout, SettingsDestination.ABOUT);
        setupRow(binding.rowLogout, SettingsDestination.LOGOUT);

        binding.navScanFromSettings.setOnClickListener(v -> navigateTo(R.id.action_settingsFragment_to_scanFragment));
        binding.navHistoryFromSettings.setOnClickListener(v -> navigateTo(R.id.action_settingsFragment_to_historyFragment));
        // Settings tab is already active; no navigation needed
    }

    private void setupRow(@NonNull LinearLayout row, @NonNull SettingsDestination destination) {
        row.setOnClickListener(v -> handleDestination(destination));
    }

    private void handleDestination(@NonNull SettingsDestination destination) {
        switch (destination) {
            case ABOUT:
                showAboutDialog();
                break;
            case LOGOUT:
                handleLogout();
                break;
            case PROFILE:
            case NOTIFICATIONS:
            case APP_SETTINGS:
            default:
                // Placeholder for future sections
                showComingSoon();
                break;
        }
    }

    private void showAboutDialog() {
        if (!isAdded()) {
            return;
        }
        new AlertDialog.Builder(requireContext())
                .setTitle(R.string.settings_dialog_about_title)
                .setMessage(R.string.settings_about_description)
                .setPositiveButton(android.R.string.ok, null)
                .show();
    }

    private void showComingSoon() {
        if (!isAdded()) {
            return;
        }
        new AlertDialog.Builder(requireContext())
                .setMessage(R.string.feature_coming_soon)
                .setPositiveButton(android.R.string.ok, null)
                .show();
    }

    private void handleLogout() {
        viewModel.updateDisplayName(null);
        viewModel.setPendingImageUri(null);
        viewModel.resetStatus();
        navigateTo(R.id.action_settingsFragment_to_loginFragment);
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

    private enum SettingsDestination {
        PROFILE,
        NOTIFICATIONS,
        APP_SETTINGS,
        ABOUT,
        LOGOUT
    }
}
