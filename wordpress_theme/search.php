<?php get_header(); ?>
<?php roulotte_breadcrumb(); ?>

<div class="layout">
  <main id="main" style="flex:1">
    <div class="toolbar">
      <div class="result-count"><span id="count">0</span> risultati</div>
      <select id="sortOrder" onchange="sortGrid()" class="sort-select">
        <option value="price_asc">Prezzo: Crescente</option>
        <option value="price_desc">Prezzo: Decrescente</option>
        <option value="year_desc">Anno: Più recenti</option>
        <option value="year_asc">Anno: Più vecchi</option>
      </select>
    </div>

    <div class="grid" id="productGrid">
      <?php
      $q = get_search_query();
      $args = array(
        'post_type' => 'roulotte',
        's' => $q,
        'posts_per_page' => 24,
      );
      $search = new WP_Query($args);
      if ($search->have_posts()) :
        while ($search->have_posts()) : $search->the_post();
          $marca = get_post_meta(get_the_ID(), 'marca', true);
          $modello = get_post_meta(get_the_ID(), 'modello', true);
          $anno = get_post_meta(get_the_ID(), 'anno', true);
          $prezzo = get_post_meta(get_the_ID(), 'prezzo', true);
          $listino = get_post_meta(get_the_ID(), 'prezzo_listino', true);
          $posti = get_post_meta(get_the_ID(), 'posti_letto', true);
          $lunghezza = get_post_meta(get_the_ID(), 'lunghezza', true);
          $peso = get_post_meta(get_the_ID(), 'peso_massimo', true);
          $cond = get_post_meta(get_the_ID(), 'condizione', true);
          if (!$cond) $cond = 'Usato';
          $sconto = ($listino && $prezzo) ? round((($listino - $prezzo) / $listino) * 100) : 0;
          $img_url = get_the_post_thumbnail_url(get_the_ID(), 'large');
      ?>
          <div class="card product-card" 
               data-price="<?php echo esc_attr($prezzo); ?>"
               data-year="<?php echo esc_attr($anno); ?>">
            <div class="img-wrap">
              <?php if ($img_url) : ?>
                  <img src="<?php echo esc_url($img_url); ?>" alt="<?php echo esc_attr($marca . ' ' . $modello); ?>" loading="lazy" />
              <?php else : ?>
                  <div class="no-img">No Foto</div>
              <?php endif; ?>
              <span class="badge-cond <?php echo strtolower(esc_attr($cond)); ?>"><?php echo esc_html($cond); ?></span>
              <?php if ($sconto > 0) : ?><span class="badge-sale">-<?php echo $sconto; ?>%</span><?php endif; ?>
            </div>
            <div class="content">
              <div class="header-card">
                <div class="brand"><?php echo esc_html($marca); ?></div>
                <h3 class="model"><?php echo esc_html($modello); ?></h3>
                <div class="year"><?php echo esc_html($anno); ?></div>
              </div>
              <div class="specs">
                <div class="spec-item"><span><?php echo esc_html($posti ? $posti : '-'); ?></span></div>
                <div class="spec-item"><span><?php echo esc_html($lunghezza ? $lunghezza : '-'); ?></span></div>
                <div class="spec-item"><span><?php echo esc_html($peso ? $peso : '-'); ?></span></div>
              </div>
              <div class="price-box">
                <?php if ($listino) : ?><div class="list-price">Listino: €<?php echo number_format($listino, 0, ',', '.'); ?></div><?php endif; ?>
                <div class="final-price">€ <?php echo number_format((float)$prezzo, 0, ',', '.'); ?></div>
              </div>
              <a href="<?php the_permalink(); ?>" class="cta-button">Scopri di più</a>
            </div>
          </div>
      <?php
        endwhile; wp_reset_postdata();
      else:
        echo '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light)">Nessun risultato per "'.esc_html($q).'"</div>';
      endif;
      ?>
    </div>
  </main>
</div>

<script>
  function sortGrid() {
    const grid = document.getElementById('productGrid');
    const cards = Array.from(grid.getElementsByClassName('product-card'));
    const sortVal = document.getElementById('sortOrder').value;
    cards.sort((a, b) => {
      const priceA = Number(a.dataset.price);
      const priceB = Number(b.dataset.price);
      const yearA = Number(a.dataset.year);
      const yearB = Number(b.dataset.year);
      if (sortVal === 'price_asc') return priceA - priceB;
      if (sortVal === 'price_desc') return priceB - priceA;
      if (sortVal === 'year_desc') return yearB - yearA;
      if (sortVal === 'year_asc') return yearA - yearB;
      return 0;
    });
    cards.forEach(card => grid.appendChild(card));
    document.getElementById('count').textContent = cards.filter(c=>c.style.display!=='none').length;
  }
  document.addEventListener('DOMContentLoaded', sortGrid);
</script>

<?php get_footer(); ?>
