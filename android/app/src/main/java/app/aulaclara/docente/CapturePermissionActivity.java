package app.aulaclara.docente;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.media.projection.MediaProjectionConfig;
import android.media.projection.MediaProjectionManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;

public class CapturePermissionActivity extends Activity {
    private static final int OVERLAY_REQUEST = 1201;
    private static final int CAPTURE_REQUEST = 1202;
    private String accessToken;
    private boolean entireScreen = true;

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        accessToken = getIntent().getStringExtra("token");
        if (accessToken == null || accessToken.isEmpty()) { finish(); return; }
        new AlertDialog.Builder(this)
            .setTitle("Captura de tela")
            .setMessage("O que você deseja capturar?")
            .setPositiveButton("Tela inteira", (dialog, which) -> { entireScreen = true; ensureOverlayPermission(); })
            .setNegativeButton("Um aplicativo", (dialog, which) -> { entireScreen = false; ensureOverlayPermission(); })
            .setOnCancelListener(dialog -> finish())
            .show();
    }

    private void ensureOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            startActivityForResult(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName())), OVERLAY_REQUEST);
        } else requestProjection();
    }

    private void requestProjection() {
        MediaProjectionManager manager = (MediaProjectionManager) getSystemService(MEDIA_PROJECTION_SERVICE);
        Intent request;
        if (Build.VERSION.SDK_INT >= 34) {
            MediaProjectionConfig config = entireScreen ? MediaProjectionConfig.createConfigForDefaultDisplay() : MediaProjectionConfig.createConfigForUserChoice();
            request = manager.createScreenCaptureIntent(config);
        } else request = manager.createScreenCaptureIntent();
        startActivityForResult(request, CAPTURE_REQUEST);
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == OVERLAY_REQUEST) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(this)) requestProjection(); else finish();
            return;
        }
        if (requestCode == CAPTURE_REQUEST) {
            if (resultCode == RESULT_OK && data != null) {
                Intent service = new Intent(this, ScreenCaptureService.class);
                service.putExtra("resultCode", resultCode); service.putExtra("resultData", data); service.putExtra("token", accessToken);
                if (Build.VERSION.SDK_INT >= 26) startForegroundService(service); else startService(service);
                moveTaskToBack(true);
            }
            finish();
        }
    }
}
