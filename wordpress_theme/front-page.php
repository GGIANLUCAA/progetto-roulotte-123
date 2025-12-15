<?php get_header(); ?>

<section class="hero">
  <div class="hero-inner">
    <h1 class="hero-title">Trova la tua Roulotte</h1>
    <p class="hero-sub">Catalogo aggiornato, filtri rapidi, foto e video</p>
    <form action="<?php echo esc_url( home_url( '/' ) ); ?>" method="get" class="searchbar" style="margin-top:1rem">
      <input type="search" name="s" placeholder="Cerca marca, modello..." value="<?php echo get_search_query(); ?>" />
      <input type="hidden" name="post_type" value="roulotte" />
      <button type="submit">Cerca</button>
    </form>
    <div class="hero-actions" style="gap:0.75rem">
      <a href="<?php echo esc_url( home_url( '/catalogo/' ) ); ?>" class="cta-button" style="min-width:180px">Catalogo</a>
      <a href="<?php echo esc_url( add_query_arg( ['post_type' => 'roulotte'], home_url( '/' ) ) ); ?>" class="cta-button" style="min-width:180px;background:var(--blue)">Ricerca</a>
    </div>
  </div>
  <div class="hero-bg"></div>
</section>

<div class="layout">
  <main style="flex:1">
    <div class="quick-nav" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-bottom:1rem">
      <a class="card" href="<?php echo esc_url( home_url( '/catalogo/' ) ); ?>" style="text-decoration:none">
        <h3 style="margin:0 0 .25rem">Catalogo</h3>
        <div class="muted">Sfoglia tutte le roulotte disponibili</div>
      </a>
      <a class="card" href="<?php echo esc_url( add_query_arg( ['post_type' => 'roulotte'], home_url( '/' ) ) ); ?>" style="text-decoration:none">
        <h3 style="margin:0 0 .25rem">Ricerca</h3>
        <div class="muted">Cerca per marca o modello</div>
      </a>
    </div>
    <div class="toolbar">
      <div class="result-count"><span id="count">0</span> veicoli disponibili</div>
      <input type="text" id="textSearch" class="filter-input" placeholder="Cerca marca o modello" oninput="filterGrid()" style="max-width:260px">
      <select id="sortOrder" onchange="sortGrid()" class="sort-select">
        <option value="price_asc">Prezzo: Crescente</option>
        <option value="price_desc">Prezzo: Decrescente</option>
        <option value="year_desc">Anno: Più recenti</option>
        <option value="year_asc">Anno: Più vecchi</option>
      </select>
    </div>

    <div class="grid" id="productGrid">
      <?php
      $args = array(
        'post_type' => 'roulotte',
        'posts_per_page' => 12,
        'post_status' => 'publish',
      );
      $q = new WP_Query($args);
      if ($q->have_posts()) :
        while ($q->have_posts()) : $q->the_post();
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
               data-brand="<?php echo esc_attr($marca); ?>"
               data-price="<?php echo esc_attr($prezzo); ?>"
               data-year="<?php echo esc_attr($anno); ?>"
               data-beds="<?php echo esc_attr($posti); ?>"
               data-cond="<?php echo esc_attr($cond); ?>"
               data-text="<?php echo esc_attr(strtolower(trim(($marca ?: '').' '.($modello ?: '')))); ?>">
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
                <div class="spec-item" title="Posti letto"><span><?php echo esc_html($posti ? $posti : '-'); ?></span></div>
                <div class="spec-item" title="Lunghezza (m)"><span><?php echo esc_html($lunghezza ? $lunghezza : '-'); ?></span></div>
                <div class="spec-item" title="Peso max (kg)"><span><?php echo esc_html($peso ? $peso : '-'); ?></span></div>
              </div>
              <div class="price-box">
                <?php if ($listino) : ?><div class="list-price">Listino: €<?php echo number_format($listino, 0, ',', '.'); ?></div><?php endif; ?>
                <div class="final-price">€ <?php echo number_format((float)$prezzo, 0, ',', '.'); ?></div>
              </div>
              <a href="<?php the_permalink(); ?>" class="cta-button">Dettagli</a>
            </div>
          </div>
      <?php
        endwhile; wp_reset_postdata();
      else:
        echo '<div id="no-results" style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light)">Nessuna roulotte disponibile al momento.</div>';
      endif;
      ?>
    </div>
    <div style="display:flex;justify-content:center;margin:1.5rem 0"><a class="cta-button" href="<?php echo esc_url( home_url( '/catalogo/' ) ); ?>">Vedi tutto il catalogo</a></div>
  </main>
</div>

<script>
  function filterGrid() {
    const q = (document.getElementById('textSearch').value || '').toLowerCase().trim();
    let visibleCount = 0;
    document.querySelectorAll('.product-card').forEach(card => {
      const cardText = (card.dataset.text || '').toLowerCase();
      const match = !q || cardText.includes(q);
      if (match) { card.style.display = 'flex'; visibleCount++; } else { card.style.display = 'none'; }
    });
    document.getElementById('count').textContent = visibleCount;
  }
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
  }
  document.addEventListener('DOMContentLoaded', () => { filterGrid(); sortGrid(); });
</script>

<?php get_footer(); ?>
