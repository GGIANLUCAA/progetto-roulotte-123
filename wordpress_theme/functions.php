<?php
function roulotte_pro_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'menus' );
    register_nav_menus( array(
        'primary' => 'Menu Principale',
    ) );
    add_image_size( 'roulotte-card', 600, 450, true );
}
add_action( 'after_setup_theme', 'roulotte_pro_setup' );

function roulotte_pro_scripts() {
    wp_enqueue_style( 'roulotte-pro-style', get_stylesheet_uri() );
    // Add Inter font
    wp_enqueue_style( 'google-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', array(), null );
}
add_action( 'wp_enqueue_scripts', 'roulotte_pro_scripts' );

function roulotte_breadcrumb() {
    $items = [];
    $items[] = [ 'name' => 'Home', 'url' => home_url('/') ];
    if ( is_post_type_archive('roulotte') ) {
        $items[] = [ 'name' => 'Catalogo', 'url' => home_url('/catalogo/') ];
    } elseif ( is_singular('roulotte') ) {
        $items[] = [ 'name' => 'Catalogo', 'url' => home_url('/catalogo/') ];
        $items[] = [ 'name' => get_the_title(), 'url' => get_permalink() ];
    } elseif ( is_search() && get_query_var('post_type') === 'roulotte' ) {
        $items[] = [ 'name' => 'Ricerca', 'url' => add_query_arg(['post_type'=>'roulotte'], home_url('/')) ];
    }
    if (count($items) <= 1) return;
    echo '<nav class="breadcrumb" aria-label="Percorso">';
    foreach ($items as $i => $it) {
        $isLast = $i === count($items)-1;
        if ($isLast) echo '<span class="crumb current">' . esc_html($it['name']) . '</span>';
        else echo '<a class="crumb" href="' . esc_url($it['url']) . '">' . esc_html($it['name']) . '</a><span class="sep">›</span>';
    }
    echo '</nav>';
    $ld = [ '@context'=>'https://schema.org', '@type'=>'BreadcrumbList', 'itemListElement'=>[] ];
    foreach ($items as $i => $it) {
        $ld['itemListElement'][] = [ '@type'=>'ListItem', 'position'=>$i+1, 'name'=>$it['name'], 'item'=>$it['url'] ];
    }
    echo '<script type="application/ld+json">' . wp_json_encode($ld, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE) . '</script>';
}

function roulotte_meta_tags() {
    $title = wp_get_document_title();
    $desc = '';
    if ( is_singular('roulotte') ) {
        $desc = get_the_excerpt();
        if (!$desc) $desc = wp_trim_words( wp_strip_all_tags( get_the_content('') ), 30 );
    } elseif ( is_post_type_archive('roulotte') ) {
        $desc = 'Scopri il catalogo completo di roulotte: prezzi, anno, foto, video e accessori.';
    } elseif ( is_search() && get_query_var('post_type') === 'roulotte' ) {
        $q = get_search_query();
        $desc = 'Risultati di ricerca per "' . $q . '" nel catalogo roulotte.';
    }
    if ($desc) {
        echo '<meta name="description" content="' . esc_attr($desc) . '">';
        echo '<meta property="og:title" content="' . esc_attr($title) . '">';
        echo '<meta property="og:description" content="' . esc_attr($desc) . '">';
        echo '<meta property="og:type" content="website">';
        echo '<meta name="twitter:card" content="summary_large_image">';
    }
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">';
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
}
add_action('wp_head', 'roulotte_meta_tags');
?>
