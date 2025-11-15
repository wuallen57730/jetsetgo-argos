package com.example.argosapp.ui.result;

import android.content.res.ColorStateList;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.drawable.DrawableCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;

import com.bumptech.glide.Glide;
import com.example.argosapp.MainViewModel;
import com.example.argosapp.R;
import com.example.argosapp.databinding.FragmentScanResultBinding;
import com.example.argosapp.databinding.ItemDamageDetailBinding;
import com.example.argosapp.model.DamageDetail;
import com.example.argosapp.model.ScanResultUiModel;

import java.util.List;

public class ScanResultFragment extends Fragment {

    private FragmentScanResultBinding binding;
    private MainViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentScanResultBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        binding.buttonBack.setOnClickListener(v -> NavHostFragment.findNavController(this).navigateUp());
        binding.navHistoryFromResult.setOnClickListener(v -> navigateTo(R.id.action_scanResultFragment_to_historyFragment));
        binding.navScanFromResult.setOnClickListener(v -> navigateTo(R.id.action_scanResultFragment_to_scanFragment));
        binding.navSettingsFromResult.setOnClickListener(v -> navigateTo(R.id.action_scanResultFragment_to_settingsFragment));

        viewModel.latestResult.observe(getViewLifecycleOwner(), this::renderResult);
    }

    private void renderResult(@Nullable ScanResultUiModel result) {
        if (result == null) {
            NavController navController = NavHostFragment.findNavController(this);
            navController.navigateUp();
            return;
        }

        binding.textUldId.setText(result.getUldId());
        binding.chipStatus.setText(result.getSeverityLabel());

        int severityColor = getSeverityColor(result.getSeverityKey());
        binding.chipStatus.setChipBackgroundColor(ColorStateList.valueOf(severityColor));
        binding.chipStatus.setTextColor(ContextCompat.getColor(requireContext(), android.R.color.white));

        binding.textDamageCategory.setText(result.getPrimaryDamageTitle());
        binding.textDamageLevel.setText(
                getString(R.string.scan_result_level_format, result.getSeverityLabel(), result.getSeverityDescription())
        );
        binding.textSuggestion.setText(getString(R.string.scan_result_suggestion, result.getPrimarySuggestion()));

        if (!TextUtils.isEmpty(result.getYoloSummary())) {
            binding.textFindings.setVisibility(View.VISIBLE);
            binding.textFindings.setText(getString(R.string.scan_result_findings_prefix, result.getYoloSummary()));
        } else {
            binding.textFindings.setVisibility(View.GONE);
        }

        if (result.getImageUri() != null) {
            binding.cardPreview.setVisibility(View.VISIBLE);
            Glide.with(this)
                    .load(result.getImageUri())
                    .into(binding.imagePreview);
        } else {
            binding.cardPreview.setVisibility(View.GONE);
        }

        populateDamageDetails(result.getDamageDetails());
    }

    private void populateDamageDetails(@NonNull List<DamageDetail> details) {
        binding.listDamageContainer.removeAllViews();

        if (details.isEmpty()) {
            binding.textDamageHeader.setText(R.string.scan_result_no_damage);
            return;
        }

        binding.textDamageHeader.setText(R.string.scan_result_damage_header);

        LayoutInflater inflater = LayoutInflater.from(requireContext());
        for (DamageDetail detail : details) {
            ItemDamageDetailBinding itemBinding = ItemDamageDetailBinding.inflate(inflater, binding.listDamageContainer, false);
            itemBinding.textDamageTitle.setText(detail.getTitle());
            itemBinding.textDamageSeverity.setText(detail.getSeverityLabel());
            itemBinding.textDamageSuggestion.setText(detail.getSuggestion());

            int color = getSeverityColor(detail.getSeverityKey());
            DrawableCompat.setTint(
                    DrawableCompat.wrap(itemBinding.viewSeverityDot.getBackground()).mutate(),
                    color
            );

            binding.listDamageContainer.addView(itemBinding.getRoot());
        }
    }

    private int getSeverityColor(@NonNull String severityKey) {
        switch (severityKey) {
            case "green":
                return ContextCompat.getColor(requireContext(), R.color.severity_green);
            case "yellow":
                return ContextCompat.getColor(requireContext(), R.color.severity_yellow);
            case "red":
                return ContextCompat.getColor(requireContext(), R.color.severity_red);
            default:
                return ContextCompat.getColor(requireContext(), R.color.severity_unknown);
        }
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

