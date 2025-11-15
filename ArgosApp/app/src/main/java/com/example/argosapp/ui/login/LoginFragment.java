package com.example.argosapp.ui.login;

import android.graphics.Paint;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;
import android.view.inputmethod.EditorInfo;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.fragment.NavHostFragment;

import com.example.argosapp.MainViewModel;
import com.example.argosapp.R;
import com.example.argosapp.databinding.FragmentLoginBinding;

public class LoginFragment extends Fragment {

    private FragmentLoginBinding binding;
    private MainViewModel viewModel;
    private TextWatcher clearErrorWatcher;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentLoginBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        binding.textRegisterLink.setPaintFlags(binding.textRegisterLink.getPaintFlags() | Paint.UNDERLINE_TEXT_FLAG);

        clearErrorWatcher = new SimpleTextWatcher(() -> binding.errorContainer.setVisibility(View.GONE));
        binding.editEmployeeId.addTextChangedListener(clearErrorWatcher);
        binding.editPassword.addTextChangedListener(clearErrorWatcher);
        binding.editPassword.setOnEditorActionListener((TextView v, int actionId, android.view.KeyEvent event) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                handleLogin();
                return true;
            }
            return false;
        });

        binding.buttonLogin.setOnClickListener(v -> handleLogin());
        binding.textForgotPassword.setOnClickListener(v ->
                Toast.makeText(requireContext(), R.string.feature_coming_soon, Toast.LENGTH_SHORT).show());
        binding.textRegisterLink.setOnClickListener(v ->
                Toast.makeText(requireContext(), R.string.feature_coming_soon, Toast.LENGTH_SHORT).show());
    }

    private void handleLogin() {
        String identifier = getTrimmed(binding.editEmployeeId.getText());
        String password = getTrimmed(binding.editPassword.getText());

        if (identifier.isEmpty() || password.isEmpty()) {
            showError(getString(R.string.login_error_missing_fields));
            return;
        }

        viewModel.updateDisplayName(identifier);
        binding.errorContainer.setVisibility(View.GONE);
        NavHostFragment.findNavController(this).navigate(R.id.action_loginFragment_to_scanFragment);
    }

    private void showError(@NonNull String message) {
        binding.errorContainer.setVisibility(View.VISIBLE);
        binding.textErrorMessage.setText(message);
    }

    private String getTrimmed(@Nullable Editable editable) {
        return editable == null ? "" : editable.toString().trim();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (clearErrorWatcher != null) {
            binding.editEmployeeId.removeTextChangedListener(clearErrorWatcher);
            binding.editPassword.removeTextChangedListener(clearErrorWatcher);
            clearErrorWatcher = null;
        }
        binding = null;
    }

    private static class SimpleTextWatcher implements TextWatcher {

        private final Runnable afterChangedAction;

        SimpleTextWatcher(Runnable afterChangedAction) {
            this.afterChangedAction = afterChangedAction;
        }

        @Override
        public void beforeTextChanged(CharSequence s, int start, int count, int after) {
        }

        @Override
        public void onTextChanged(CharSequence s, int start, int before, int count) {
        }

        @Override
        public void afterTextChanged(Editable s) {
            if (afterChangedAction != null) {
                afterChangedAction.run();
            }
        }
    }
}
