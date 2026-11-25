-- Adds schema.org JSON-LD so search engines understand who wrote what:
-- a Person + WebSite on the home and about pages, a BlogPosting on each post.
local SITE = "https://muralik.in"
local PERSON = {
  ["@type"] = "Person",
  name = "Murali Kummitha",
  alternateName = { "Murali K", "Kummitha Murali" },
  jobTitle = "Staff Software Engineer",
  url = SITE .. "/about.html",
  image = SITE .. "/profile.jpeg",
  sameAs = {
    "https://github.com/iamurali",
    "https://www.linkedin.com/in/muralikummitha",
    "https://twitter.com/muralikummitha",
  },
  knowsAbout = { "Agentic AI systems", "Distributed systems", "Platform engineering",
                 "Model Context Protocol", "Data engineering", "Ruby on Rails", "PostgreSQL" },
}

local function str(x) return x and pandoc.utils.stringify(x) or nil end

local function meta_tag(prop, content)
  quarto.doc.include_text("in-header", '<meta property="' .. prop .. '" content="' .. content .. '">')
end

local function emit(data)
  local json = pandoc.json.encode(data):gsub("</", "<\\/")
  quarto.doc.include_text("in-header", '<script type="application/ld+json">' .. json .. "</script>")
end

function Meta(m)
  if not quarto.doc.is_format("html") then return m end
  local rel = pandoc.path.make_relative(quarto.doc.input_file, quarto.project.directory)
  local url = SITE .. "/" .. rel:gsub("index%.qmd$", ""):gsub("%.qmd$", ".html")
  meta_tag("og:url", url)

  if rel == "index.qmd" or rel == "about.qmd" then
    local person = {}
    for k, v in pairs(PERSON) do person[k] = v end
    person["@context"] = "https://schema.org"
    if rel == "about.qmd" then
      emit({ ["@context"] = "https://schema.org", ["@type"] = "ProfilePage", url = url, mainEntity = person })
    else
      emit(person)
    end
    if rel == "index.qmd" then
      emit({ ["@context"] = "https://schema.org", ["@type"] = "WebSite",
             name = "Murali Kummitha", alternateName = "muralik.in", url = SITE .. "/" })
    end
  elseif m.date and m.title then
    local tags = {}
    if m.categories then for _, c in ipairs(m.categories) do table.insert(tags, str(c)) end end
    emit({
      ["@context"] = "https://schema.org",
      ["@type"] = "BlogPosting",
      headline = str(m.title),
      description = str(m.description),
      datePublished = str(m.date),
      dateModified = str(m["date-modified"] or m.date),
      publisher = { ["@type"] = "Person", name = "Murali Kummitha", url = SITE .. "/" },
      author = PERSON,
      url = url,
      mainEntityOfPage = url,
      image = SITE .. "/images/social-card.png",
      keywords = table.concat(tags, ", "),
    })
  end
  return m
end
