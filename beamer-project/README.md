# Normalized Cuts and Image Segmentation — Beamer Project

This is a complete LaTeX Beamer conversion of the PowerPoint presentation
**"Normalized Cuts and Image Segmentation lakshmi's.pptx"**, based on the paper
**Jianbo Shi and Jitendra Malik, "Normalized Cuts and Image Segmentation", IEEE
PAMI, 2000**.

All original images and visual assets embedded in the PPTX have been extracted
and included unchanged in the `images/` folder. No image has been lost, replaced,
or recreated.

---

## Project structure

```text
beamer-project/
│
├── main.tex
│
├── images/
│   ├── slide1_title_bg.jpg
│   ├── slide3_graph_nodes.png
│   ├── slide3_graph_edges.png
│   ├── slide3_graph_weight.png
│   ├── slide3_partition_goal.png
│   ├── slide4_min_cut.png
│   ├── slide5_ncut_formula.png
│   ├── slide5_ncut_example.png
│   ├── slide6_nassoc_formula1.png
│   ├── slide6_nassoc_formula2.png
│   ├── slide6_ncut_nassoc_relation.jpg
│   ├── slide7_eigen_system.png
│   ├── slide7_affinity_formula.png
│   ├── slide7_diagonal_formula.png
│   ├── slide7_eigenvalue.png
│   ├── slide10_eigen_system.png
│   ├── slide13_ncut_results.jpg
│   ├── slide14_medical_imaging.png
│   ├── slide14_autonomous_driving.jpg
│   └── slide14_photo_editing.jpg
│
└── README.md
```

---

## How to compile

The project is designed to work on **Overleaf** and any standard TeX
distribution (TeX Live / MiKTeX) with `pdflatex`.

### On Overleaf

1. Create a new project and upload the `main.tex` file together with the
   `images/` folder (keep the relative folder structure exactly as shown above).
2. Set the compiler to **pdfLaTeX**.
3. Click **Recompile**. The PDF will be generated.

### Locally (pdflatex)

From inside the `beamer-project/` directory, run:

```bash
pdflatex main.tex
```

Run `pdflatex` again if you want the table of contents / references resolved
(optional for this deck).

---

## Content coverage

Every one of the **15 slides** from the original PPTX has been converted, in the
original order:

| PPTX / Beamer slide | Title |
|---------------------|-------|
| 1  | NORMALIZED CUTS & IMAGE SEGMENTATION (title) |
| 2  | Abstract |
| 3  | Grouping as graph partitioning |
| 4  | The Min-Cut |
| 5  | The Mathematical Solution (NCut) |
| 6  | The Mathematical Solution (Nassoc) |
| 7  | Mathematical Formulation |
| 8  | The Grouping Algorithm — Step 1: Construct the graph |
| 9  | The Grouping Algorithm — Step 2: Construct the matrices |
| 10 | The Grouping Algorithm — Step 3: Solve eigen system |
| 11 | The Grouping Algorithm — Step 4: Split graph |
| 12 | The Grouping Algorithm — Step 5: Recursive cut |
| 13 | Ncut Results |
| 14 | Practical Applications |
| 15 | Conclusion |
| —  | References / Thank You |

---

## Image-to-slide mapping (asset verification)

All **20 images** from `ppt/media/` have been preserved and mapped to their
correct slides:

| PPTX file | Beamer file | Used on slide |
|-----------|-------------|---------------|
| image1.jpeg   | slide1_title_bg.jpg              | 1 |
| image2.png    | slide3_graph_nodes.png          | 3 |
| image3.png    | slide3_graph_edges.png          | 3 |
| image4.png    | slide3_graph_weight.png         | 3 |
| image5.png    | slide3_partition_goal.png       | 3 |
| image50.png   | slide4_min_cut.png              | 4 |
| image6.png    | slide5_ncut_formula.png         | 5 |
| image7.png    | slide5_ncut_example.png         | 5 |
| image8.png    | slide6_nassoc_formula1.png      | 6 |
| image9.png    | slide6_nassoc_formula2.png      | 6 |
| image10.jpeg  | slide6_ncut_nassoc_relation.jpg | 6 |
| image11.png   | slide7_eigen_system.png         | 7 |
| image180.png  | slide7_affinity_formula.png     | 7 |
| image190.png  | slide7_diagonal_formula.png     | 7 |
| image20.png   | slide7_eigenvalue.png           | 7 |
| image18.png   | slide10_eigen_system.png        | 10 |
| image12.jpeg  | slide13_ncut_results.jpg        | 13 |
| image13.png   | slide14_medical_imaging.png     | 14 |
| image14.jpeg  | slide14_autonomous_driving.jpg  | 14 |
| image15.jpeg  | slide14_photo_editing.jpg       | 14 |

> **Note:** The original PPTX contained no external media, audio, video, or fonts;
> only JPEG/PNG images were embedded, and all of them are included above.

---

## Notes

- Image formatting (equations shown as images) is preserved by referencing the
  original extracted image files rather than retyping them, so the exact visual
  appearance is retained.
- Equations that were editable PowerPoint math objects (slide 3, 4, 6, 7, 10)
  have been recreated with LaTeX mathematics for a clean, scalable look, while
  the slides that contained the formulas *as images* use the original extraction.
- LaTeX special characters (`%`, `&`, `_`, `#`, `$`, `{`, `}`) in the original
  text have been escaped correctly.
