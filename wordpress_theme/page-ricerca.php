<?php get_header(); ?>
<?php roulotte_breadcrumb(); ?>

<div class="layout">
  <aside class="filters" aria-label="Filtri ricerca">
    <form method="get" action="">
      <input type="hidden" name="post_type" value="roulotte" />
      <div class="filter-group">
        <div class="filter-title">Marca</div>
        <?php
        $terms = get_terms(['taxonomy'=>'marca','hide_empty'=>false]);
        foreach ($terms as $t) {
          $checked = isset($_GET['marca']) && $_GET['marca'] === $t->name ? 'checked' : '';
          echo '<label class="filter-opt"><input type="radio" name="marca" value="'.esc_attr($t->name).'" '.$checked.'> '.esc_html($t->name).'</label>';
        }
        ?>
      </div>
      <div class="filter-group">
        <div class="filter-title">Modello</div>
        <input class="filter-input" type="text" name="modello" value="<?php echo esc_attr($_GET['modello'] ?? ''); ?>" />
      </div>
      <div class="filter-group">
        <div class="filter-title">Anno</div>
        <div style="display:flex; gap:0.5rem;">
          <input type="number" class="filter-input" name="anno_min" placeholder="Dal" value="<?php echo esc_attr($_GET['anno_min'] ?? ''); ?>" />
          <input type="number" class="filter-input" name="anno_max" placeholder="Al" value="<?php echo esc_attr($_GET['anno_max'] ?? ''); ?>" />
        </div>
      </div>
      <div class="filter-group">
        <div class="filter-title">Prezzo</div>
        <div style="display:flex; gap:0.5rem;">
          <input type="number" class="filter-input" name="prezzo_min" placeholder="Min" value="<?php echo esc_attr($_GET['prezzo_min'] ?? ''); ?>" />
          <input type="number" class="filter-input" name="prezzo_max" placeholder="Max" value="<?php echo esc_attr($_GET['prezzo_max'] ?? ''); ?>" />
        </div>
      </div>
      <div class="filter-group">
        <div class="filter-title">Posti Letto</div>
        <input type="number" class="filter-input" name="posti" placeholder="es. 4" value="<?php echo esc_attr($_GET['posti'] ?? ''); ?>" />
      </div>
      <button class="cta-button" type="submit" aria-label="Applica filtri">Applica filtri</button>
    </form>
  </aside>

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
      $meta = [];
      if (!empty($_GET['modello'])) $meta[] = [ 'key'=>'modello', 'value'=>sanitize_text_field($_GET['modello']), 'compare'=>'LIKE' ];
      if (!empty($_GET['prezzo_min']) || !empty($_GET['prezzo_max'])) {
        $min = isset($_GET['prezzo_min']) ? (int)$_GET['prezzo_min'] : 0;
        $max = isset($_GET['prezzo_max']) ? (int)$_GET['prezzo_max'] : 9999999;
        $meta[] = [ 'key'=>'prezzo', 'value'=>[$min,$max], 'type'=>'NUMERIC', 'compare'=>'BETWEEN' ];
      }
      if (!empty($_GET['anno_min']) || !empty($_GET['anno_max'])) {
        $amin = isset($_GET['anno_min']) ? (int)$_GET['anno_min'] : 0;
        $amax = isset($_GET['anno_max']) ? (int)$_GET['anno_max'] : 9999;
        $meta[] = [ 'key'=>'anno', 'value'=>[$amin,$amax], 'type'=>'NUMERIC', 'compare'=>'BETWEEN' ];
      }
      if (!empty($_GET['posti'])) $meta[] = [ 'key'=>'posti_letto', 'value'=>(int)$_GET['posti'], 'type'=>'NUMERIC', 'compare'=>'>=' ];

      $taxq = [];
      if (!empty($_GET['marca'])) $taxq[] = [ 'taxonomy'=>'marca', 'field'=>'name', 'terms'=>sanitize_text_field($_GET['marca']) ];

      $args = [
        'post_type' => 'roulotte',
        'posts_per_page' => 24,
        'post_status' => 'publish',
        'meta_query' => $meta,
        'tax_query' => $taxq,
      ];
      $q = new WP_Query($args);
      if ($q->have_posts()) :
        while ($q->have_posts()) : $q->the_post();
          $marca = get_post_meta(get_the_ID(), 'marca', true);
          $modello = get_post_meta(get_the_ID(), 'modello', true);
          $anno = get_post_meta(get_the_ID(), 'anno', true);
          $prezzo = get_post_meta(get_the_ID(), 'prezzo', true);
          $listino = get_post_meta(get_the_ID(), 'prezzo_listino', true);
          $posti = get_post_meta(get_the_ID(), 'posti_letto', true);
          $cond = get_post_meta(get_the_ID(), 'condizione', true);
          if (!$cond) $cond = 'Usato';
          $img_url = get_the_post_thumbnail_url(get_the_ID(), 'large');
          $sconto = ($listino && $prezzo) ? round((($listino - $prezzo) / $listino) * 100) : 0;
      ?>
        <div class="card product-card" data-price="<?php echo esc_attr($prezzo); ?>" data-year="<?php echo esc_attr($anno); ?>">
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
            <div class="price-box">
              <?php if ($listino) : ?><div class="list-price">Listino: €<?php echo number_format($listino, 0, ',', '.'); ?></div><?php endif; ?>
              <div class="final-price">€ <?php echo number_format((float)$prezzo, 0, ',', '.'); ?></div>
            </div>
            <a href="<?php the_permalink(); ?>" class="cta-button" aria-label="Apri dettagli">Dettagli</a>
          </div>
        </div>
      <?php endwhile; wp_reset_postdata(); else: ?>
        <div id="no-results" style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light)">Nessun risultato</div>
      <?php endif; ?>
    </div>
  </main>
</div>

<script>
function sortGrid(){const g=document.getElementById('productGrid');const c=Array.from(g.getElementsByClassName('product-card'));const s=document.getElementById('sortOrder').value;c.sort((a,b)=>{const pa=Number(a.dataset.price),pb=Number(b.dataset.price),ya=Number(a.dataset.year),yb=Number(b.dataset.year);if(s==='price_asc')return pa-pb;if(s==='price_desc')return pb-pa;if(s==='year_desc')return yb-ya;if(s==='year_asc')return ya-yb;return 0;});c.forEach(x=>g.appendChild(x));document.getElementById('count').textContent=c.filter(x=>x.style.display!=='none').length;}
document.addEventListener('DOMContentLoaded', sortGrid);
</script>

<?php get_footer(); ?>

