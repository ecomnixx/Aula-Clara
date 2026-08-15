package app.aulaclara.docente;

import android.app.*;
import android.content.*;
import android.graphics.*;
import android.graphics.drawable.GradientDrawable;
import android.hardware.display.DisplayManager;
import android.media.Image;
import android.media.ImageReader;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.net.Uri;
import android.os.*;
import android.util.DisplayMetrics;
import android.view.*;
import android.widget.ImageButton;
import java.io.*;
import java.net.*;
import java.nio.ByteBuffer;
import org.json.JSONObject;

public class ScreenCaptureService extends Service {
    private static final String CHANNEL = "aula_clara_capture";
    private WindowManager windowManager; private ImageButton bubble; private MediaProjection projection; private ImageReader reader; private String token;
    private int width, height, density; private WindowManager.LayoutParams bubbleParams;

    @Override public void onCreate() { super.onCreate(); createChannel(); }
    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        token = intent.getStringExtra("token"); int resultCode = intent.getIntExtra("resultCode", Activity.RESULT_CANCELED); Intent resultData = intent.getParcelableExtra("resultData");
        startForeground(42, notification("Toque na bolinha para capturar"), Build.VERSION.SDK_INT >= 29 ? 32 : 0);
        DisplayMetrics metrics = getResources().getDisplayMetrics(); width = metrics.widthPixels; height = metrics.heightPixels; density = metrics.densityDpi;
        reader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 3);
        MediaProjectionManager manager = (MediaProjectionManager) getSystemService(MEDIA_PROJECTION_SERVICE); projection = manager.getMediaProjection(resultCode, resultData);
        projection.registerCallback(new MediaProjection.Callback() {
            @Override public void onStop() { removeBubble(); stopSelf(); }
        }, new Handler(Looper.getMainLooper()));
        projection.createVirtualDisplay("AulaClaraCapture", width, height, density, DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, reader.getSurface(), null, null);
        showBubble(); return START_NOT_STICKY;
    }
    private void showBubble() {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE); bubble = new ImageButton(this); bubble.setImageResource(android.R.drawable.ic_menu_camera); bubble.setColorFilter(Color.WHITE); bubble.setAlpha(.82f); bubble.setPadding(18,18,18,18);
        GradientDrawable background = new GradientDrawable(); background.setShape(GradientDrawable.OVAL); background.setColor(Color.rgb(57,87,105)); background.setStroke(3,Color.WHITE); bubble.setBackground(background);
        int size=(int)(58*getResources().getDisplayMetrics().density); bubbleParams=new WindowManager.LayoutParams(size,size,Build.VERSION.SDK_INT>=26?WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY:WindowManager.LayoutParams.TYPE_PHONE,WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE|WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,PixelFormat.TRANSLUCENT);bubbleParams.gravity=Gravity.TOP|Gravity.RIGHT;bubbleParams.x=8;bubbleParams.y=(int)(120*getResources().getDisplayMetrics().density);windowManager.addView(bubble,bubbleParams);
        bubble.setOnTouchListener(new View.OnTouchListener() {
            float downY; int startY; boolean moved;
            @Override public boolean onTouch(View view, android.view.MotionEvent event) {
                if (event.getAction() == android.view.MotionEvent.ACTION_DOWN) { downY=event.getRawY(); startY=bubbleParams.y; moved=false; return true; }
                if (event.getAction() == android.view.MotionEvent.ACTION_MOVE) { float delta=event.getRawY()-downY; if(Math.abs(delta)>8)moved=true; bubbleParams.y=Math.max(0,Math.min(ScreenCaptureService.this.height-size,startY+(int)delta)); bubbleParams.x=8; windowManager.updateViewLayout(bubble,bubbleParams); return true; }
                if (event.getAction() == android.view.MotionEvent.ACTION_UP) { bubbleParams.x=8; windowManager.updateViewLayout(bubble,bubbleParams); if(!moved)captureAfterDelay(); return true; }
                return false;
            }
        });
    }
    private void captureAfterDelay(){if(bubble==null)return;bubble.setVisibility(View.INVISIBLE);new Handler(Looper.getMainLooper()).postDelayed(this::capture,1000);}
    private void capture(){Image image=reader.acquireLatestImage();if(image==null){new Handler(Looper.getMainLooper()).postDelayed(this::capture,150);return;}try{Image.Plane plane=image.getPlanes()[0];ByteBuffer buffer=plane.getBuffer();int pixelStride=plane.getPixelStride(),rowStride=plane.getRowStride(),padding=rowStride-pixelStride*width;Bitmap padded=Bitmap.createBitmap(width+padding/pixelStride,height,Bitmap.Config.ARGB_8888);padded.copyPixelsFromBuffer(buffer);Bitmap bitmap=Bitmap.createBitmap(padded,0,0,width,height);padded.recycle();ByteArrayOutputStream output=new ByteArrayOutputStream();bitmap.compress(Bitmap.CompressFormat.PNG,100,output);bitmap.recycle();removeBubble();new Thread(()->uploadAndReturn(output.toByteArray())).start();}finally{image.close();}}
    private void uploadAndReturn(byte[] png){try{URL url=new URL("https://fdlpzljfgtpinmfczvjx.supabase.co/functions/v1/android-capture-bridge");HttpURLConnection connection=(HttpURLConnection)url.openConnection();connection.setRequestMethod("POST");connection.setDoOutput(true);connection.setRequestProperty("Authorization","Bearer "+token);connection.setRequestProperty("apikey","sb_publishable_H6bPqgxyGSNAVCi2geFOEQ__0W_NiTH");connection.setRequestProperty("Content-Type","image/png");connection.setFixedLengthStreamingMode(png.length);try(OutputStream stream=connection.getOutputStream()){stream.write(png);}InputStream response=connection.getResponseCode()<300?connection.getInputStream():connection.getErrorStream();String body=read(response);if(connection.getResponseCode()>=300)throw new IOException(body);String id=new JSONObject(body).getString("id");Intent launch=new Intent(this,LauncherActivity.class);launch.setData(Uri.parse("https://aulaclara-docente.vercel.app/?source=android&view=create&capture_id="+id));launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);startActivity(launch);}catch(Exception error){Intent launch=new Intent(this,LauncherActivity.class);launch.setData(Uri.parse("https://aulaclara-docente.vercel.app/?source=android&view=create&capture_error=1"));launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);startActivity(launch);}finally{stopEverything();}}
    private String read(InputStream stream)throws IOException{BufferedReader reader=new BufferedReader(new InputStreamReader(stream));StringBuilder value=new StringBuilder();String line;while((line=reader.readLine())!=null)value.append(line);return value.toString();}
    private void removeBubble(){new Handler(Looper.getMainLooper()).post(()->{if(bubble!=null){try{windowManager.removeView(bubble);}catch(Exception ignored){}bubble=null;}});}
    private void stopEverything(){removeBubble();if(reader!=null)reader.close();if(projection!=null)projection.stop();stopForeground(true);stopSelf();}
    private void createChannel(){if(Build.VERSION.SDK_INT>=26){NotificationChannel channel=new NotificationChannel(CHANNEL,"Captura de tela",NotificationManager.IMPORTANCE_LOW);getSystemService(NotificationManager.class).createNotificationChannel(channel);}}
    private Notification notification(String text){return new Notification.Builder(this,Build.VERSION.SDK_INT>=26?CHANNEL:"").setSmallIcon(android.R.drawable.ic_menu_camera).setContentTitle("Aula Clara").setContentText(text).setOngoing(true).build();}
    @Override public void onDestroy(){removeBubble();if(reader!=null){reader.close();reader=null;}if(projection!=null){projection.stop();projection=null;}super.onDestroy();}
    @Override public android.os.IBinder onBind(Intent intent){return null;}
}
