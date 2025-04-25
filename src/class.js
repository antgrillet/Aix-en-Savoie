export class Article {
  constructor(
    id,
    titre,
    categorie,
    date,
    image,
    resume,
    contenu,
    vedette = false,
    tag = "",
    tags = []
  ) {
    this.id = id;
    this.titre = titre;
    this.categorie = categorie;
    this.date = date;
    this.image = image;
    this.resume = resume;
    this.contenu = contenu;
    this.vedette = vedette;
    this.tag = tag;
    this.tags = tags;
  }
}

export async function createArticle() {
  try {
    const response = await fetch("./data/actualites.json");
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    const articles = data.map(
      (item) =>
        new Article(
          item.id,
          item.titre,
          item.categorie,
          item.date,
          item.image,
          item.resume,
          item.contenu,
          item.vedette,
          item.tag,
          item.tags
        )
    );

    return articles;
  } catch (error) {
    console.error("Erreur lors du chargement des articles:", error);
    return [];
  }
}
