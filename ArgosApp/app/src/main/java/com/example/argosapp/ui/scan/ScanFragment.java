package com.example.argosapp.ui.scan;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;

import com.bumptech.glide.Glide;
import com.example.argosapp.AppStatus;
import com.example.argosapp.MainViewModel;
import com.example.argosapp.R;
import com.example.argosapp.databinding.FragmentScanBinding;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

public class ScanFragment extends Fragment {

    private FragmentScanBinding binding;
    private MainViewModel viewModel;
    @Nullable
    private Uri latestTmpUri;

    private final ActivityResultLauncher<String> requestPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
                if (isGranted) {
                    launchCamera();
                } else if (isAdded()) {
                    Toast.makeText(requireContext(), R.string.scan_permission_required, Toast.LENGTH_SHORT).show();
                }
            });

    private final ActivityResultLauncher<Uri> takePictureLauncher =
            registerForActivityResult(new ActivityResultContracts.TakePicture(), success -> {
                if (success && latestTmpUri != null) {
                    viewModel.setPendingImageUri(latestTmpUri);
                    try (InputStream is = requireContext().getContentResolver().openInputStream(latestTmpUri)) {
                        Bitmap bitmap = BitmapFactory.decodeStream(is);
                        if (bitmap != null) {
                            viewModel.processImageAndUpload(bitmap);
                        } else {
                            viewModel.resetStatus();
                            showError(getString(R.string.scan_status_error_prefix, getString(R.string.scan_error_read_photo)));
                        }
                    } catch (Exception e) {
                        viewModel.resetStatus();
                        showError(getString(R.string.scan_status_error_prefix, e.getMessage()));
                    }
                } else {
                    viewModel.resetStatus();
                }
            });

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentScanBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getUserDisplayName().observe(getViewLifecycleOwner(), name -> {
            String displayName = (name == null || name.trim().isEmpty())
                    ? getString(R.string.scan_default_user_name)
                    : name;
            binding.textWelcome.setText(getString(R.string.scan_welcome_title, displayName));
        });

        binding.buttonCapture.setOnClickListener(v -> requestCameraPermission());
        binding.buttonProfile.setOnClickListener(v -> navigateTo(R.id.action_scanFragment_to_settingsFragment));
        binding.buttonSimulateGreen.setOnClickListener(v ->
                viewModel.simulateAndUpload("ULD-GREEN-DEMO", "no damage found, ULD is serviceable"));
        binding.buttonSimulateRed.setOnClickListener(v ->
                viewModel.simulateAndUpload("ULD-RED-DEMO", "severe puncture detected on base plate, ULD is unserviceable"));

        viewModel.getLastCapturedImage().observe(getViewLifecycleOwner(), this::renderPreview);
        renderPreview(viewModel.getLastCapturedImage().getValue());

        binding.navHistory.setOnClickListener(v -> navigateTo(R.id.action_scanFragment_to_historyFragment));
        binding.navSettings.setOnClickListener(v -> navigateTo(R.id.action_scanFragment_to_settingsFragment));

        viewModel.status.observe(getViewLifecycleOwner(), this::renderStatus);
    }

    private void renderStatus(AppStatus status) {
        if (status instanceof AppStatus.Idle) {
            showIdle();
        } else if (status instanceof AppStatus.Processing) {
            showProcessing(((AppStatus.Processing) status).message);
        } else if (status instanceof AppStatus.Error) {
            showError(getString(R.string.scan_status_error_prefix, ((AppStatus.Error) status).message));
        } else if (status instanceof AppStatus.Success) {
            showSuccess();
        }
    }

    private void showIdle() {
        binding.progressIndicator.setVisibility(View.GONE);
        binding.buttonCapture.setEnabled(true);
        binding.buttonSimulateGreen.setEnabled(true);
        binding.buttonSimulateRed.setEnabled(true);
        binding.textStatus.setText(R.string.scan_status_idle);
    }

    private void showProcessing(String message) {
        binding.progressIndicator.setVisibility(View.VISIBLE);
        binding.buttonCapture.setEnabled(false);
        binding.buttonSimulateGreen.setEnabled(false);
        binding.buttonSimulateRed.setEnabled(false);
        binding.textStatus.setText(message);
    }

    private void showError(String message) {
        binding.progressIndicator.setVisibility(View.GONE);
        binding.buttonCapture.setEnabled(true);
        binding.buttonSimulateGreen.setEnabled(true);
        binding.buttonSimulateRed.setEnabled(true);
        binding.textStatus.setText(message);
    }

    private void showSuccess() {
        binding.progressIndicator.setVisibility(View.GONE);
        binding.buttonCapture.setEnabled(true);
        binding.buttonSimulateGreen.setEnabled(true);
        binding.buttonSimulateRed.setEnabled(true);
        binding.textStatus.setText(R.string.scan_status_success);

        NavController navController = NavHostFragment.findNavController(this);
        if (navController.getCurrentDestination() != null
                && navController.getCurrentDestination().getId() == R.id.scanFragment) {
            navController.navigate(R.id.action_scanFragment_to_scanResultFragment);
        }
        viewModel.resetStatus();
    }

    private void requestCameraPermission() {
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED) {
            launchCamera();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void launchCamera() {
        try {
            File photoFile = File.createTempFile("scan_", ".jpg", requireContext().getCacheDir());
            latestTmpUri = FileProvider.getUriForFile(
                    requireContext(),
                    "com.example.argosapp.fileprovider",
                    photoFile
            );
            takePictureLauncher.launch(latestTmpUri);
        } catch (IOException e) {
            showError(getString(R.string.scan_status_error_prefix, e.getMessage()));
        }
    }

    private void navigateTo(int actionId) {
        NavController navController = NavHostFragment.findNavController(this);
        navController.navigate(actionId);
    }

    private void renderPreview(@Nullable Uri uri) {
        if (!isAdded() || binding == null) {
            return;
        }
        if (uri == null) {
            binding.imagePreview.setVisibility(View.GONE);
            binding.viewPreviewPlaceholder.setVisibility(View.VISIBLE);
        } else {
            binding.viewPreviewPlaceholder.setVisibility(View.GONE);
            binding.imagePreview.setVisibility(View.VISIBLE);
            Glide.with(this)
                    .load(uri)
                    .centerCrop()
                    .into(binding.imagePreview);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}

