package com.example.argosapp.ui.history;

import android.net.Uri;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.drawable.DrawableCompat;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.ListAdapter;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.example.argosapp.R;
import com.example.argosapp.databinding.ItemHistoryCardBinding;
import com.example.argosapp.model.ScanHistoryItem;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

class HistoryAdapter extends ListAdapter<ScanHistoryItem, HistoryViewHolder> {

    private final SimpleDateFormat dateFormat =
            new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());

    HistoryAdapter() {
        super(DIFF_CALLBACK);
    }

    @NonNull
    @Override
    public HistoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater inflater = LayoutInflater.from(parent.getContext());
        ItemHistoryCardBinding binding = ItemHistoryCardBinding.inflate(inflater, parent, false);
        return new HistoryViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull HistoryViewHolder holder, int position) {
        ScanHistoryItem item = getItem(position);
        ItemHistoryCardBinding binding = holder.binding;
        binding.textUld.setText(item.getUldId());
        binding.textDamageTitle.setText(item.getDamageTitle());
        binding.textSeverity.setText(item.getSeverityLabel());
        binding.textSummary.setText(item.getSummary());
        binding.textSuggestion.setText(
                holder.itemView.getContext().getString(R.string.scan_result_suggestion, item.getSuggestion())
        );
        binding.textTimestamp.setText(dateFormat.format(new Date(item.getTimestamp())));

        applySeverityStyles(binding, item.getSeverityKey());

        String imageUri = item.getImageUri();
        if (imageUri != null && !imageUri.isEmpty()) {
            binding.imagePreview.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
            Glide.with(binding.imagePreview)
                    .load(Uri.parse(imageUri))
                    .diskCacheStrategy(DiskCacheStrategy.NONE)
                    .skipMemoryCache(true)
                    .placeholder(R.drawable.argos_logo)
                    .into(binding.imagePreview);
        } else {
            binding.imagePreview.setScaleType(android.widget.ImageView.ScaleType.CENTER_INSIDE);
            binding.imagePreview.setImageResource(R.drawable.argos_logo);
        }
    }

    private void applySeverityStyles(@NonNull ItemHistoryCardBinding binding, @NonNull String severityKey) {
        @ColorInt int chipColor;
        @ColorInt int dotColor;
        switch (severityKey) {
            case "red":
                chipColor = ContextCompat.getColor(binding.getRoot().getContext(), R.color.severity_red);
                dotColor = chipColor;
                break;
            case "yellow":
                chipColor = ContextCompat.getColor(binding.getRoot().getContext(), R.color.severity_yellow);
                dotColor = chipColor;
                break;
            case "green":
                chipColor = ContextCompat.getColor(binding.getRoot().getContext(), R.color.severity_green);
                dotColor = chipColor;
                break;
            default:
                chipColor = ContextCompat.getColor(binding.getRoot().getContext(), R.color.severity_unknown);
                dotColor = chipColor;
                break;
        }

        View chip = binding.chipContainer;
        if (chip.getBackground() != null) {
            DrawableCompat.setTint(
                    DrawableCompat.wrap(chip.getBackground()).mutate(),
                    adjustAlpha(chipColor, 0.3f)
            );
        } else {
            chip.setBackgroundColor(adjustAlpha(chipColor, 0.3f));
        }
        View dot = binding.viewSeverityDot;
        DrawableCompat.setTint(DrawableCompat.wrap(dot.getBackground()).mutate(), dotColor);
        binding.textSeverity.setTextColor(dotColor);
    }

    @ColorInt
    private int adjustAlpha(@ColorInt int color, float factor) {
        int alpha = Math.round(android.graphics.Color.alpha(color) * factor);
        int red = android.graphics.Color.red(color);
        int green = android.graphics.Color.green(color);
        int blue = android.graphics.Color.blue(color);
        return android.graphics.Color.argb(alpha, red, green, blue);
    }

    private static final DiffUtil.ItemCallback<ScanHistoryItem> DIFF_CALLBACK =
            new DiffUtil.ItemCallback<ScanHistoryItem>() {
                @Override
                public boolean areItemsTheSame(@NonNull ScanHistoryItem oldItem, @NonNull ScanHistoryItem newItem) {
                    return oldItem.getTimestamp() == newItem.getTimestamp()
                            && oldItem.getUldId().equals(newItem.getUldId());
                }

                @Override
                public boolean areContentsTheSame(@NonNull ScanHistoryItem oldItem, @NonNull ScanHistoryItem newItem) {
                    return oldItem.getSeverityKey().equals(newItem.getSeverityKey())
                            && oldItem.getDamageTitle().equals(newItem.getDamageTitle())
                            && oldItem.getSuggestion().equals(newItem.getSuggestion())
                            && oldItem.getImageUri().equals(newItem.getImageUri());
                }
            };
}

