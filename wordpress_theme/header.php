<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
  <a href="#main" class="skip-link">Salta al contenuto</a>
  <header>
    <a href="<?php echo home_url(); ?>" class="logo">ROULOTTE<span>PRO</span></a>
    <div style="display:flex;align-items:center;gap:1rem">
      <?php
        wp_nav_menu([
          'theme_location' => 'primary',
          'container' => false,
          'menu_class' => 'main-menu',
          'fallback_cb' => function(){
            echo '<nav class="main-menu">'
               . '<a class="nav-link" href="' . esc_url( home_url('/catalogo/') ) . '">Catalogo</a>'
               . '<a class="nav-link" href="' . esc_url( add_query_arg( ['post_type' => 'roulotte'], home_url('/') ) ) . '">Ricerca</a>'
               . ( is_user_logged_in() && current_user_can('edit_posts') ? '<a class="nav-link" href="' . esc_url( home_url('/inserisci-annuncio/') ) . '">Inserisci annuncio</a>' : '' )
               . '<a class="nav-link" href="' . esc_url( admin_url() ) . '">Area Riservata</a>'
               . '</nav>';
          }
        ]);
      ?>
      <form action="<?php echo esc_url( home_url( '/' ) ); ?>" method="get" class="searchbar">
        <input type="search" name="s" placeholder="Cerca marca, modello..." value="<?php echo get_search_query(); ?>" />
        <input type="hidden" name="post_type" value="roulotte" />
        <button type="submit">Cerca</button>
      </form>
    </div>
  </header>
