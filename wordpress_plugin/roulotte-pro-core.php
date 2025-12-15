<?php
/**
 * Plugin Name: Roulotte Manager Pro
 * Description: Gestione avanzata per Roulotte Pro: Custom Post Type, Campi Personalizzati, API e Generazione PDF.
 * Version: 1.3.0
 * Author: Trae AI
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// 1. Registrazione Custom Post Type e Tassonomie
function rp_register_cpt() {
    register_post_type( 'roulotte', array(
        'labels' => array(
            'name' => 'Roulottes',
            'singular_name' => 'Roulotte',
            'add_new' => 'Aggiungi Nuova',
            'edit_item' => 'Modifica Roulotte',
            'view_item' => 'Vedi Roulotte',
            'search_items' => 'Cerca Roulottes',
        ),
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'supports' => array( 'title', 'editor', 'thumbnail', 'custom-fields' ),
        'menu_icon' => 'dashicons-car',
        'rewrite' => array( 'slug' => 'catalogo' ),
    ));

    register_taxonomy( 'marca', 'roulotte', array(
        'labels' => array( 'name' => 'Marche' ),
        'public' => true,
        'hierarchical' => true,
        'show_in_rest' => true,
    ));
}
add_action( 'init', 'rp_register_cpt' );

// 2. Meta Box Personalizzati Completi
function rp_add_meta_boxes() {
    add_meta_box( 'rp_details', 'Scheda Tecnica & Condizioni', 'rp_render_meta_box', 'roulotte', 'normal', 'high' );
}
add_action( 'add_meta_boxes', 'rp_add_meta_boxes' );

function rp_render_meta_box( $post ) {
    $values = get_post_custom( $post->ID );
    wp_enqueue_media();
    
    // Helper function
    $get = function($k, $d='') use ($values) { return isset($values[$k][0]) ? $values[$k][0] : $d; };

    // Data Fields
    $prezzo = $get('prezzo');
    $listino = $get('prezzo_listino');
    $anno = $get('anno');
    $posti = $get('posti_letto');
    $peso_max = $get('peso_massimo');
    $peso_vuoto = $get('peso_vuoto');
    $lunghezza = $get('lunghezza');
    $larghezza = $get('larghezza');
    $condizione = $get('condizione', 'Usato');
    $garanzia = $get('garanzia_mesi');
    $trattabile = $get('trattabile');
    $trasporto = $get('trasporto');
    $disponibile = $get('disponibile_da');
    $accessori = $get('accessori');
    
    // Checklist statuses
    $doc_libretto = $get('doc_libretto');
    $doc_gas = $get('doc_gas');
    $comp_cucina = $get('comp_cucina');
    $comp_bagno = $get('comp_bagno');
    $comp_stufa = $get('comp_stufa');
    $comp_frigo = $get('comp_frigo');
    $imp_elettrico = $get('imp_elettrico');
    $imp_gas = $get('imp_gas');
    $imp_idrico = $get('imp_idrico');

    wp_nonce_field( 'rp_save_meta_box_data', 'rp_meta_box_nonce' );
    $gallery_ids = isset($values['gallery_ids'][0]) ? $values['gallery_ids'][0] : '';
    $video_id = isset($values['video_id'][0]) ? $values['video_id'][0] : '';
    ?>
    <style>
        .rp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .rp-field label { display: block; font-weight: 600; margin-bottom: 5px; }
        .rp-field input, .rp-field select, .rp-field textarea { width: 100%; }
        .rp-section-title { font-size: 1.1em; font-weight: bold; margin: 20px 0 10px; border-bottom: 2px solid #ddd; padding-bottom: 5px; color: #2271b1; }
        .rp-check-group { display: flex; gap: 15px; flex-wrap: wrap; }
        .rp-check-item { background: #f9f9f9; padding: 10px; border: 1px solid #ddd; border-radius: 4px; flex: 1; min-width: 150px; }
    </style>

    <!-- Economico -->
    <div class="rp-section-title">Prezzi e Vendita</div>
    <div class="rp-grid">
        <div class="rp-field"><label>Prezzo Finale (€)</label><input type="number" name="prezzo" value="<?php echo esc_attr($prezzo); ?>"></div>
        <div class="rp-field"><label>Prezzo Listino (€)</label><input type="number" name="prezzo_listino" value="<?php echo esc_attr($listino); ?>"></div>
        <div class="rp-field">
            <label>Opzioni Vendita</label>
            <label><input type="checkbox" name="trattabile" value="1" <?php checked($trattabile, '1'); ?>> Trattabile</label><br>
            <label><input type="checkbox" name="trasporto" value="1" <?php checked($trasporto, '1'); ?>> Trasporto incluso</label>
        </div>
        <div class="rp-field"><label>Disponibile dal</label><input type="date" name="disponibile_da" value="<?php echo esc_attr($disponibile); ?>"></div>
    </div>

    <!-- Dati Tecnici -->
    <div class="rp-section-title">Dati Tecnici</div>
    <div class="rp-grid">
        <div class="rp-field"><label>Anno</label><input type="number" name="anno" value="<?php echo esc_attr($anno); ?>"></div>
        <div class="rp-field"><label>Condizione</label>
            <select name="condizione">
                <option value="Nuovo" <?php selected($condizione, 'Nuovo'); ?>>Nuovo</option>
                <option value="Usato" <?php selected($condizione, 'Usato'); ?>>Usato</option>
                <option value="Km0" <?php selected($condizione, 'Km0'); ?>>Km0</option>
            </select>
        </div>
        <div class="rp-field"><label>Posti Letto</label><input type="number" name="posti_letto" value="<?php echo esc_attr($posti); ?>"></div>
        <div class="rp-field"><label>Garanzia (Mesi)</label><input type="number" name="garanzia_mesi" value="<?php echo esc_attr($garanzia); ?>"></div>
    </div>
    <div class="rp-grid">
        <div class="rp-field"><label>Lunghezza (m)</label><input type="text" name="lunghezza" value="<?php echo esc_attr($lunghezza); ?>"></div>
        <div class="rp-field"><label>Larghezza (m)</label><input type="text" name="larghezza" value="<?php echo esc_attr($larghezza); ?>"></div>
        <div class="rp-field"><label>Peso Vuoto (kg)</label><input type="number" name="peso_vuoto" value="<?php echo esc_attr($peso_vuoto); ?>"></div>
        <div class="rp-field"><label>Peso Max (kg)</label><input type="number" name="peso_massimo" value="<?php echo esc_attr($peso_max); ?>"></div>
    </div>

    <!-- Checklists -->
    <div class="rp-section-title">Stato Componenti e Documenti</div>
    <div class="rp-check-group">
        <div class="rp-check-item">
            <strong>Documenti</strong><br>
            <label><input type="checkbox" name="doc_libretto" value="1" <?php checked($doc_libretto, '1'); ?>> Libretto Presente</label><br>
            <label><input type="checkbox" name="doc_gas" value="1" <?php checked($doc_gas, '1'); ?>> Certificato Gas</label>
        </div>
        <div class="rp-check-item">
            <strong>Impianti (Funzionanti)</strong><br>
            <label><input type="checkbox" name="imp_elettrico" value="1" <?php checked($imp_elettrico, '1'); ?>> Elettrico</label><br>
            <label><input type="checkbox" name="imp_gas" value="1" <?php checked($imp_gas, '1'); ?>> Gas</label><br>
            <label><input type="checkbox" name="imp_idrico" value="1" <?php checked($imp_idrico, '1'); ?>> Idrico</label>
        </div>
        <div class="rp-check-item">
            <strong>Interni (Presenti/OK)</strong><br>
            <label><input type="checkbox" name="comp_cucina" value="1" <?php checked($comp_cucina, '1'); ?>> Cucina</label><br>
            <label><input type="checkbox" name="comp_bagno" value="1" <?php checked($comp_bagno, '1'); ?>> Bagno</label><br>
            <label><input type="checkbox" name="comp_stufa" value="1" <?php checked($comp_stufa, '1'); ?>> Stufa</label><br>
            <label><input type="checkbox" name="comp_frigo" value="1" <?php checked($comp_frigo, '1'); ?>> Frigo</label>
        </div>
    </div>

    <!-- Accessori -->
    <div class="rp-section-title">Accessori</div>
    <div class="rp-field">
        <textarea name="accessori" rows="4" placeholder="Veranda, Mover, Pannello Solare..."><?php echo esc_textarea($accessori); ?></textarea>
        <p class="description">Inserisci gli accessori separati da virgola.</p>
    </div>
    <div class="rp-section-title">Galleria Immagini e Video</div>
    <div class="rp-grid">
        <div class="rp-field">
            <label>Immagini</label>
            <input type="hidden" id="rp_gallery_ids" name="gallery_ids" value="<?php echo esc_attr($gallery_ids); ?>">
            <button type="button" class="button" id="rp_add_images">Aggiungi Immagini</button>
            <div id="rp_gallery_preview" style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"></div>
        </div>
        <div class="rp-field">
            <label>Video</label>
            <input type="hidden" id="rp_video_id" name="video_id" value="<?php echo esc_attr($video_id); ?>">
            <button type="button" class="button" id="rp_add_video">Aggiungi Video</button>
            <div id="rp_video_preview" style="margin-top:8px"></div>
        </div>
    </div>
    <script>
    (function(){
        if (typeof wp !== 'undefined' && wp.media) {
            var galleryInput = document.getElementById('rp_gallery_ids');
            var videoInput = document.getElementById('rp_video_id');
            var gp = document.getElementById('rp_gallery_preview');
            var vp = document.getElementById('rp_video_preview');
            function renderThumb(id, url){
                var d = document.createElement('div');
                d.style.width='70px'; d.style.height='70px'; d.style.border='1px solid #ddd'; d.style.borderRadius='4px'; d.style.overflow='hidden';
                var i = document.createElement('img'); i.src=url; i.style.width='100%'; i.style.height='100%'; i.style.objectFit='cover';
                d.appendChild(i); gp.appendChild(d);
            }
            function renderVideo(url){
                vp.innerHTML='';
                var v=document.createElement('video'); v.controls=true; v.src=url; v.style.maxWidth='100%';
                vp.appendChild(v);
            }
            document.getElementById('rp_add_images').addEventListener('click', function(){
                var frame = wp.media({ title:'Seleziona immagini', multiple:true, library:{ type:'image' } });
                frame.on('select', function(){
                    var sel = frame.state().get('selection');
                    var ids = galleryInput.value ? galleryInput.value.split(',').filter(Boolean) : [];
                    sel.each(function(att){
                        var a = att.toJSON();
                        ids.push(String(a.id));
                        var url = a.sizes && a.sizes.thumbnail ? a.sizes.thumbnail.url : a.url;
                        renderThumb(a.id, url);
                    });
                    galleryInput.value = Array.from(new Set(ids)).join(',');
                });
                frame.open();
            });
            document.getElementById('rp_add_video').addEventListener('click', function(){
                var frame = wp.media({ title:'Seleziona video', multiple:false, library:{ type:'video' } });
                frame.on('select', function(){
                    var att = frame.state().get('selection').first().toJSON();
                    videoInput.value = String(att.id);
                    renderVideo(att.url);
                });
                frame.open();
            });
        }
    })();
    </script>
    <?php
}

function rp_save_meta_box_data( $post_id ) {
    if ( ! isset( $_POST['rp_meta_box_nonce'] ) || ! wp_verify_nonce( $_POST['rp_meta_box_nonce'], 'rp_save_meta_box_data' ) ) return;
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;

    $fields = [
        'prezzo', 'prezzo_listino', 'anno', 'posti_letto', 'peso_massimo', 'peso_vuoto', 
        'lunghezza', 'larghezza', 'condizione', 'garanzia_mesi', 'disponibile_da', 'accessori',
        'trattabile', 'trasporto', 
        'doc_libretto', 'doc_gas', 
        'comp_cucina', 'comp_bagno', 'comp_stufa', 'comp_frigo', 
        'imp_elettrico', 'imp_gas', 'imp_idrico', 'gallery_ids', 'video_id'
    ];

    foreach ( $fields as $field ) {
        if ( isset( $_POST[ $field ] ) ) {
            update_post_meta( $post_id, $field, sanitize_text_field( $_POST[ $field ] ) );
        } else {
            // Checkboxes need explicit clearing if unchecked
            if (in_array($field, ['trattabile', 'trasporto', 'doc_libretto', 'doc_gas', 'comp_cucina', 'comp_bagno', 'comp_stufa', 'comp_frigo', 'imp_elettrico', 'imp_gas', 'imp_idrico'])) {
                delete_post_meta($post_id, $field);
            }
        }
    }
}
add_action( 'save_post', 'rp_save_meta_box_data' );

// 3. Endpoint PDF (Simulato per ora, ma predisposto)
add_action( 'rest_api_init', function () {
    register_rest_route( 'roulotte-pro/v1', '/pdf/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => function($data) {
            return array( 'url' => home_url( '/?p=' . $data['id'] . '&print=pdf' ) );
        },
        'permission_callback' => '__return_true',
    ));
});

// 4. Importatore JSON Aggiornato
function rp_register_import_page() {
    add_submenu_page( 'edit.php?post_type=roulotte', 'Importa JSON', 'Importa JSON', 'manage_options', 'rp-import', 'rp_render_import_page' );
}
add_action( 'admin_menu', 'rp_register_import_page' );

// 5. Aggiorna Tema/Plugin via ZIP (Admin Only)
function rp_register_update_page() {
    add_submenu_page(
        'edit.php?post_type=roulotte',
        'Aggiorna Tema/Plugin',
        'Aggiorna Tema/Plugin',
        'manage_options',
        'rp-update',
        'rp_render_update_page'
    );
}
add_action( 'admin_menu', 'rp_register_update_page' );

function rp_render_update_page() {
    if ( ! current_user_can( 'manage_options' ) ) return;
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    require_once ABSPATH . 'wp-admin/includes/theme.php';
    ?>
    <div class="wrap">
        <h1>Aggiorna Tema/Plugin (Upload ZIP)</h1>
        <p>Carica gli archivi ZIP generati dal progetto (roulotte-manager-pro.zip e roulotte-pro-theme.zip) per aggiornare rapidamente.</p>
        <form method="post" enctype="multipart/form-data">
            <?php wp_nonce_field('rp_update_zip', 'rp_update_nonce'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">Plugin ZIP</th>
                    <td><input type="file" name="plugin_zip" accept=".zip"></td>
                </tr>
                <tr>
                    <th scope="row">Tema ZIP</th>
                    <td><input type="file" name="theme_zip" accept=".zip"></td>
                </tr>
            </table>
            <?php submit_button('Carica e Aggiorna'); ?>
        </form>
    </div>
    <?php
    if ( $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['rp_update_nonce']) && wp_verify_nonce($_POST['rp_update_nonce'], 'rp_update_zip') ) {
        $results = [];
        $upload_overrides = [ 'test_form' => false ];
        // Process Plugin ZIP
        if ( isset($_FILES['plugin_zip']) && !empty($_FILES['plugin_zip']['name']) ) {
            $movefile = wp_handle_upload( $_FILES['plugin_zip'], $upload_overrides );
            if ( isset($movefile['file']) ) {
                $zip = $movefile['file'];
                $dest = WP_PLUGIN_DIR; // expects root folder "roulotte-manager-pro" dentro lo zip
                $res = unzip_file( $zip, $dest );
                if ( is_wp_error($res) ) { $results[] = 'Plugin: errore unzip - ' . esc_html($res->get_error_message()); }
                else { $results[] = 'Plugin aggiornato correttamente'; wp_clean_plugins_cache(); }
            } else {
                $results[] = 'Plugin: upload non riuscito';
            }
        }
        // Process Theme ZIP
        if ( isset($_FILES['theme_zip']) && !empty($_FILES['theme_zip']['name']) ) {
            $movefile = wp_handle_upload( $_FILES['theme_zip'], $upload_overrides );
            if ( isset($movefile['file']) ) {
                $zip = $movefile['file'];
                $dest = get_theme_root(); // expects root folder "roulotte-pro-theme" dentro lo zip
                $res = unzip_file( $zip, $dest );
                if ( is_wp_error($res) ) { $results[] = 'Tema: errore unzip - ' . esc_html($res->get_error_message()); }
                else { $results[] = 'Tema aggiornato correttamente'; wp_clean_themes_cache(); }
            } else {
                $results[] = 'Tema: upload non riuscito';
            }
        }
        if ( !empty($results) ) {
            echo '<div class="updated"><p>' . implode('<br>', array_map('esc_html', $results)) . '</p></div>';
            echo '<p><a class="button button-primary" href="' . esc_url( admin_url('edit.php?post_type=roulotte&page=rp-import') ) . '">Vai all\'Importatore</a> ';
            echo '<a class="button" href="' . esc_url( home_url('/catalogo/') ) . '">Apri Catalogo</a></p>';
        }
    }
}

function rp_submit_shortcode() {
    if ( ! is_user_logged_in() || ! current_user_can('edit_posts') ) {
        $login = wp_login_url( get_permalink() );
        return '<div class="alert"><strong>Accesso richiesto.</strong> <a href="'.esc_url($login).'">Accedi</a> per creare un\'inserzione.</div>';
    }
    $out = '';
    if ( $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['rp_submit_nonce']) && wp_verify_nonce($_POST['rp_submit_nonce'], 'rp_submit') ) {
        $marca = sanitize_text_field($_POST['marca'] ?? '');
        $modello = sanitize_text_field($_POST['modello'] ?? '');
        $anno = intval($_POST['anno'] ?? 0);
        $prezzo = floatval($_POST['prezzo'] ?? 0);
        $cond = sanitize_text_field($_POST['condizione'] ?? 'Usato');
        $posti = intval($_POST['posti_letto'] ?? 0);
        $content = wp_kses_post($_POST['descrizione'] ?? '');
        $title = trim($marca.' '.$modello);
        $post_id = wp_insert_post([
            'post_title' => $title ? $title : 'Roulotte',
            'post_content' => $content,
            'post_status' => 'publish',
            'post_type' => 'roulotte',
        ]);
        if ( $post_id && ! is_wp_error($post_id) ) {
            update_post_meta($post_id, 'marca', $marca);
            update_post_meta($post_id, 'modello', $modello);
            if ($anno) update_post_meta($post_id, 'anno', $anno);
            if ($prezzo) update_post_meta($post_id, 'prezzo', $prezzo);
            if ($posti) update_post_meta($post_id, 'posti_letto', $posti);
            if ($cond) update_post_meta($post_id, 'condizione', $cond);
            if (!empty($marca)) wp_set_object_terms($post_id, $marca, 'marca', true);
            if ( ! function_exists('media_handle_upload') ) require_once ABSPATH . 'wp-admin/includes/image.php';
            if ( ! function_exists('wp_handle_upload') ) require_once ABSPATH . 'wp-admin/includes/file.php';
            if ( ! function_exists('wp_generate_attachment_metadata') ) require_once ABSPATH . 'wp-admin/includes/media.php';
            if ( isset($_FILES['featured_image']) && !empty($_FILES['featured_image']['name']) ) {
                $fid = media_handle_upload('featured_image', $post_id);
                if ( ! is_wp_error($fid) ) set_post_thumbnail($post_id, $fid);
            }
            $gallery_ids = [];
            if ( isset($_FILES['gallery_images']) && !empty($_FILES['gallery_images']['name'][0]) ) {
                $files = $_FILES['gallery_images'];
                for ($i=0; $i<count($files['name']); $i++) {
                    if (empty($files['name'][$i])) continue;
                    $file = [
                        'name' => $files['name'][$i],
                        'type' => $files['type'][$i],
                        'tmp_name' => $files['tmp_name'][$i],
                        'error' => $files['error'][$i],
                        'size' => $files['size'][$i]
                    ];
                    $_FILES['single_gallery'] = $file;
                    $aid = media_handle_upload('single_gallery', $post_id);
                    if ( ! is_wp_error($aid) ) $gallery_ids[] = $aid;
                }
                if ($gallery_ids) update_post_meta($post_id, 'gallery_ids', implode(',', $gallery_ids));
            }
            if ( isset($_FILES['video_file']) && !empty($_FILES['video_file']['name']) ) {
                $vid = media_handle_upload('video_file', $post_id);
                if ( ! is_wp_error($vid) ) update_post_meta($post_id, 'video_id', $vid);
            }
            $out .= '<div class="updated"><p>Inserzione creata. <a href="'.esc_url(get_permalink($post_id)).'">Apri scheda</a></p></div>';
        } else {
            $out .= '<div class="error"><p>Errore creazione inserzione.</p></div>';
        }
    }
    ob_start();
    ?>
    <form method="post" enctype="multipart/form-data" class="rp-submit-form" style="display:grid;gap:1rem">
        <?php wp_nonce_field('rp_submit', 'rp_submit_nonce'); ?>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.75rem">
            <div><label>Marca<input required type="text" name="marca"></label></div>
            <div><label>Modello<input required type="text" name="modello"></label></div>
            <div><label>Anno<input type="number" name="anno" min="1970" max="2099"></label></div>
            <div><label>Prezzo (€)<input type="number" name="prezzo" step="1"></label></div>
            <div><label>Posti Letto<input type="number" name="posti_letto" min="0" max="12"></label></div>
            <div><label>Condizione
                <select name="condizione">
                    <option value="Usato">Usato</option>
                    <option value="Nuovo">Nuovo</option>
                    <option value="Km0">Km0</option>
                </select>
            </label></div>
        </div>
        <div><label>Descrizione<textarea name="descrizione" rows="5" placeholder="Descrizione dettagliata"></textarea></label></div>
        <div><label>Foto principale<input type="file" name="featured_image" accept="image/*"></label></div>
        <div><label>Galleria immagini<input type="file" name="gallery_images[]" accept="image/*" multiple></label></div>
        <div><label>Video (opzionale)<input type="file" name="video_file" accept="video/*"></label></div>
        <button type="submit" class="button button-primary">Pubblica Inserzione</button>
    </form>
    <?php
    $form = ob_get_clean();
    return $out . $form;
}
add_shortcode('roulotte_submit', 'rp_submit_shortcode');

function rp_render_import_page() {
    ?>
    <div class="wrap">
        <h1>Importa Roulotte da JSON (Full Data)</h1>
        <form method="post" enctype="multipart/form-data">
            <input type="file" name="json_file" accept=".json">
            <?php submit_button('Carica e Importa'); ?>
        </form>
    </div>
    <?php
    if ( isset( $_FILES['json_file'] ) ) {
        $json = file_get_contents( $_FILES['json_file']['tmp_name'] );
        $data = json_decode( $json, true );

        if ( ! is_array( $data ) ) {
            echo '<div class="error"><p>File JSON non valido o vuoto.</p></div>';
        } else {
            foreach ( $data as $item ) {
                $title = ($item['marca'] ?? 'N/D') . ' ' . ($item['modello'] ?? '');
                
                // Check duplicate
                $existing = get_page_by_title($title, OBJECT, 'roulotte');
                if ($existing) continue;

                $post_data = array(
                    'post_title'    => $title,
                    'post_content'  => isset($item['descrizioni'][0]['text']) ? $item['descrizioni'][0]['text'] : '',
                    'post_status'   => 'publish',
                    'post_type'     => 'roulotte',
                );
                
                $post_id = wp_insert_post( $post_data );
                
                if ( $post_id ) {
                    // Basic
                    update_post_meta( $post_id, 'marca', $item['marca'] ?? '' );
                    update_post_meta( $post_id, 'modello', $item['modello'] ?? '' );
                    update_post_meta( $post_id, 'anno', $item['anno'] ?? '' );
                    
                    // Prices
                    update_post_meta( $post_id, 'prezzo', $item['prezzo_richiesto'] ?? 0 );
                    update_post_meta( $post_id, 'prezzo_listino', $item['prezzo_consigliato'] ?? 0 );
                    if (isset($item['dettagli']['prezzo_condizioni']['trattabile']) && $item['dettagli']['prezzo_condizioni']['trattabile']) {
                        update_post_meta( $post_id, 'trattabile', '1' );
                    }

                    // Tech
                    if (isset($item['dimensioni']['lunghezza'])) update_post_meta( $post_id, 'lunghezza', str_replace('m','',$item['dimensioni']['lunghezza']) );
                    if (isset($item['dimensioni']['larghezza'])) update_post_meta( $post_id, 'larghezza', str_replace('m','',$item['dimensioni']['larghezza']) );
                    if (isset($item['peso']['vuoto'])) update_post_meta( $post_id, 'peso_vuoto', $item['peso']['vuoto'] );
                    if (isset($item['peso']['massimo'])) update_post_meta( $post_id, 'peso_massimo', $item['peso']['massimo'] );
                    if (isset($item['dettagli']['info_generali']['posti_letto'])) update_post_meta( $post_id, 'posti_letto', $item['dettagli']['info_generali']['posti_letto'] );
                    
                    // Status
                    if (isset($item['stato_generale'])) {
                        $st = strtolower($item['stato_generale']);
                        if ($st === 'nuovo') update_post_meta($post_id, 'condizione', 'Nuovo');
                        elseif ($st === 'usato') update_post_meta($post_id, 'condizione', 'Usato');
                        elseif ($st === 'km0' || $st === 'km 0') update_post_meta($post_id, 'condizione', 'Km0');
                    }
                    
                    // Accessori
                    if (isset($item['accessori']) && is_array($item['accessori'])) {
                        update_post_meta( $post_id, 'accessori', implode(', ', $item['accessori']) );
                    }

                    // Documents Check
                    if (isset($item['documenti']['libretto']) && $item['documenti']['libretto']) update_post_meta($post_id, 'doc_libretto', '1');
                    if (isset($item['documenti']['cert_gas']) && $item['documenti']['cert_gas']) update_post_meta($post_id, 'doc_gas', '1');

                    // Taxonomy Marca
                    if (!empty($item['marca'])) {
                        wp_set_object_terms( $post_id, $item['marca'], 'marca' );
                    }
                }
            }
            echo '<div class="updated"><p>Importazione Avanzata Completata!</p></div>';
        }
    }
}
?>
