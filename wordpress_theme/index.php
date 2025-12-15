<?php get_header(); ?>

<div class="layout">
  <!-- SIDEBAR FILTERS -->
  <aside class="filters">
    
    <!-- Filter: Marca -->
    <div class="filter-group">
      <div class="filter-title">Marca</div>
      <?php
      global $wpdb;
      $brands = $wpdb->get_col("SELECT DISTINCT meta_value FROM $wpdb->postmeta WHERE meta_key = 'marca' AND meta_value != '' ORDER BY meta_value ASC");
      if ($brands) {
          foreach ($brands as $brand) {
              echo '<label class="filter-opt"><input type="checkbox" name="brand" value="' . esc_attr($brand) . '" onchange="filterGrid()"> ' . esc_html($brand) . '</label>';
          }
      }
      ?>
    </div>

    <!-- Filter: Condizione -->
    <div class="filter-group">
      <div class="filter-title">Condizione</div>
      <label class="filter-opt"><input type="checkbox" name="condition" value="Nuovo" onchange="filterGrid()"> Nuovo</label>
      <label class="filter-opt"><input type="checkbox" name="condition" value="Usato" onchange="filterGrid()"> Usato</label>
      <label class="filter-opt"><input type="checkbox" name="condition" value="Km0" onchange="filterGrid()"> Km0</label>
    </div>

    <!-- Filter: Prezzo -->
    <div class="filter-group">
      <div class="filter-title">Prezzo Max</div>
      <input type="range" id="priceRange" min="0" max="100000" step="1000" style="width:100%" oninput="document.getElementById('priceVal').textContent='€ '+Number(this.value).toLocaleString(); filterGrid()">
      <div id="priceVal" style="font-size:0.9rem;margin-top:0.5rem;color:var(--text-light)">Tutti</div>
    </div>

    <!-- Filter: Anno -->
    <div class="filter-group">
      <div class="filter-title">Anno</div>
      <div style="display:flex; gap:0.5rem;">
        <input type="number" id="yearMin" placeholder="Dal" class="filter-input" oninput="filterGrid()">
        <input type="number" id="yearMax" placeholder="Al" class="filter-input" oninput="filterGrid()">
      </div>
    </div>

    <!-- Filter: Posti Letto -->
    <div class="filter-group">
      <div class="filter-title">Posti Letto</div>
      <label class="filter-opt"><input type="checkbox" name="beds" value="2" onchange="filterGrid()"> 2 Posti</label>
      <label class="filter-opt"><input type="checkbox" name="beds" value="4" onchange="filterGrid()"> 4 Posti</label>
      <label class="filter-opt"><input type="checkbox" name="beds" value="5" onchange="filterGrid()"> 5+ Posti</label>
    </div>

    <button class="reset-btn" onclick="resetFilters()">Resetta Filtri</button>
  </aside>
  
  <!-- MAIN GRID -->
  <main style="flex:1">
    
    <!-- Sorting Toolbar -->
    <div class="toolbar">
      <div class="result-count"><span id="count">0</span> veicoli trovati</div>
      <select id="sortOrder" onchange="sortGrid()" class="sort-select">
        <option value="price_asc">Prezzo: Crescente</option>
        <option value="price_desc">Prezzo: Decrescente</option>
        <option value="year_desc">Anno: Più recenti</option>
        <option value="year_asc">Anno: Più vecchi</option>
      </select>
    </div>

    <div class="grid" id="productGrid">
      <?php if ( have_posts() ) : ?>
        <?php while ( have_posts() ) : the_post(); ?>
          <?php
          // Retrieve Meta Data
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

          // Calculate Discount
          $sconto = 0;
          if ($listino && $prezzo) {
              $sconto = round((($listino - $prezzo) / $listino) * 100);
          }

          // Image
          $img_url = get_the_post_thumbnail_url(get_the_ID(), 'large');
          ?>
          
          <div class="card product-card" 
               data-brand="<?php echo esc_attr($marca); ?>" 
               data-price="<?php echo esc_attr($prezzo); ?>"
               data-year="<?php echo esc_attr($anno); ?>"
               data-beds="<?php echo esc_attr($posti); ?>"
               data-cond="<?php echo esc_attr($cond); ?>">
            
            <div class="img-wrap">
              <?php if ($img_url) : ?>
                  <img src="<?php echo esc_url($img_url); ?>" alt="<?php echo esc_attr($marca . ' ' . $modello); ?>" loading="lazy" />
              <?php else : ?>
                  <div class="no-img">No Foto</div>
              <?php endif; ?>
              
              <span class="badge-cond <?php echo strtolower(esc_attr($cond)); ?>"><?php echo esc_html($cond); ?></span>
              <?php if ($sconto > 0) : ?>
                  <span class="badge-sale">-<?php echo $sconto; ?>%</span>
              <?php endif; ?>
            </div>
            
            <div class="content">
              <div class="header-card">
                <div class="brand"><?php echo esc_html($marca); ?></div>
                <h3 class="model"><?php echo esc_html($modello); ?></h3>
                <div class="year"><?php echo esc_html($anno); ?></div>
              </div>
              
              <div class="specs">
                <div class="spec-item" title="Posti letto">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16M22 4v16M2 12h20M2 8h20M2 16h20"/></svg>
                  <span><?php echo esc_html($posti ? $posti : '-'); ?></span>
                </div>
                <div class="spec-item" title="Lunghezza (m)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M2 12l4-4m-4 4l4 4M22 12l-4-4m4 4l-4 4"/></svg>
                  <span><?php echo esc_html($lunghezza ? $lunghezza : '-'); ?></span>
                </div>
                <div class="spec-item" title="Peso max (kg)">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.5a2.12 2.12 0 0 0-.09-3.66Z"/><path d="M5 5.43V13a2.12 2.12 0 0 0 1.07 1.84l5.93 3.43a1.93 1.93 0 0 0 1.91 0l3.09-1.79"/></svg>
                  <span><?php echo esc_html($peso ? $peso : '-'); ?></span>
                </div>
              </div>

              <div class="price-box">
                <?php if ($listino) : ?>
                    <div class="list-price">Listino: €<?php echo number_format($listino, 0, ',', '.'); ?></div>
                <?php endif; ?>
                <div class="final-price">€ <?php echo number_format((float)$prezzo, 0, ',', '.'); ?></div>
                <?php if (get_post_meta(get_the_ID(), 'trattabile', true)) : ?>
                    <div class="nego">Trattabile</div>
                <?php endif; ?>
              </div>

              <a href="<?php the_permalink(); ?>" class="cta-button">Scopri di più</a>
            </div>
          </div>
        <?php endwhile; ?>
      <?php else : ?>
        <div id="no-results" style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light)">Nessun veicolo disponibile al momento.</div>
      <?php endif; ?>
    </div>
  </main>
</div>

<script>
  function filterGrid() {
    const brands = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(cb => cb.value);
    const conditions = Array.from(document.querySelectorAll('input[name="condition"]:checked')).map(cb => cb.value);
    const beds = Array.from(document.querySelectorAll('input[name="beds"]:checked')).map(cb => cb.value);
    const maxPrice = document.getElementById('priceRange').value > 0 ? Number(document.getElementById('priceRange').value) : Infinity;
    const yearMin = document.getElementById('yearMin').value ? Number(document.getElementById('yearMin').value) : 0;
    const yearMax = document.getElementById('yearMax').value ? Number(document.getElementById('yearMax').value) : 9999;
    
    let visibleCount = 0;

    document.querySelectorAll('.product-card').forEach(card => {
      const cardBrand = card.dataset.brand;
      const cardPrice = Number(card.dataset.price);
      const cardYear = Number(card.dataset.year);
      const cardCond = card.dataset.cond;
      const cardBeds = Number(card.dataset.beds);
      
      const brandMatch = brands.length === 0 || brands.includes(cardBrand);
      const condMatch = conditions.length === 0 || conditions.includes(cardCond);
      const priceMatch = maxPrice === 0 || maxPrice === Infinity || cardPrice <= maxPrice;
      const yearMatch = cardYear >= yearMin && cardYear <= yearMax;
      
      // Logic for beds (e.g. "5" means 5 or more)
      let bedsMatch = beds.length === 0;
      if (!bedsMatch) {
        if (beds.includes(String(cardBeds))) bedsMatch = true;
        if (beds.includes('5') && cardBeds >= 5) bedsMatch = true;
      }

      if (brandMatch && condMatch && priceMatch && yearMatch && bedsMatch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
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
  
  function resetFilters() {
      document.querySelectorAll('input[type=checkbox]').forEach(el => el.checked = false);
      document.getElementById('priceRange').value = 0;
      document.getElementById('priceVal').textContent = 'Tutti';
      document.getElementById('yearMin').value = '';
      document.getElementById('yearMax').value = '';
      filterGrid();
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
      filterGrid();
      sortGrid();
  });
</script>

<?php get_footer(); ?>
